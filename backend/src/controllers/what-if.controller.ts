import type { Response } from 'express'
import { z } from 'zod'

import { Prisma } from '../generated/prisma/client.js'
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { prisma } from '../config/prisma.js'

const requestIdParamSchema = z.object({
  requestId: z.string().uuid('Request ID is invalid'),
})

const whatIfScenarioSchema = z.object({
  budget: z.number().positive().nullable().optional(),
  batteryRequirementKwh: z.number().nonnegative().nullable().optional(),
  systemCapacityKw: z.number().positive().nullable().optional(),
  priority: z.enum(['LOWEST_PRICE', 'BALANCED', 'QUALITY', 'RELIABILITY']).nullable().optional(),
})

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function normalizePriority(value: string | null | undefined) {
  if (!value) {
    return null
  }

  return value
}

export async function runWhatIfScenario(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId
    const result = requestIdParamSchema.safeParse({
      requestId: Array.isArray(req.params.requestId)
        ? req.params.requestId[0]
        : req.params.requestId,
    })

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is invalid',
        errors: result.error.flatten(),
      })
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const validation = whatIfScenarioSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scenario parameters',
        errors: validation.error.flatten(),
      })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
    })

    if (!buyerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    const request = await prisma.solarRequest.findFirst({
      where: {
        id: result.data.requestId,
        buyerId: buyerProfile.id,
      },
      include: {
        bids: {
          orderBy: { createdAt: 'desc' },
          include: {
            supplier: {
              select: {
                id: true,
                companyName: true,
              },
            },
            versions: {
              orderBy: { versionNumber: 'desc' },
              take: 1,
            },
          },
        },
        requirementProfile: true,
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solar request not found',
      })
    }

    const baseBudget = request.budget ? Number(request.budget) : null
    const basePriority = request.priority ? String(request.priority) : null
    const scenario = validation.data

    const hypotheticalBudget = scenario.budget ?? baseBudget
    const hypotheticalPriority = scenario.priority ?? basePriority
    const hypotheticalBattery = scenario.batteryRequirementKwh ?? null
    const hypotheticalCapacity = scenario.systemCapacityKw ?? null

    const affectedProposals = request.bids.map((bid) => {
      const version = bid.versions[0] ?? null
      const currentPrice = version ? toNumber(version.totalPrice) : null
      const currentCapacity = version ? toNumber(version.panelCapacityKw) : null
      const currentBattery = version ? toNumber(version.batteryCapacityKwh) : null

      const budgetFeasible = hypotheticalBudget === null || currentPrice === null || hypotheticalBudget >= currentPrice
      const capacityFit = hypotheticalCapacity === null || currentCapacity === null || currentCapacity >= hypotheticalCapacity
      const batteryFit = hypotheticalBattery === null || currentBattery === null || currentBattery >= hypotheticalBattery

      return {
        bidId: bid.id,
        supplierName: bid.supplier.companyName,
        currentPrice,
        currentCapacity,
        currentBattery,
        budgetFeasible,
        capacityFit,
        batteryFit,
        requirementFit: budgetFeasible && capacityFit && batteryFit,
      }
    })

    const proposalCount = affectedProposals.length
    const feasibleCount = affectedProposals.filter((proposal) => proposal.requirementFit).length

    if (!request.bids[0]?.versions[0]?.id) {
      return res.status(400).json({
        success: false,
        message: 'No bid version is available to evaluate the hypothetical scenario.',
      })
    }

    const resultPayload = {
      summary: `Hypothetical scenario for ${request.title}.`,
      request: {
        id: request.id,
        title: request.title,
        currentBudget: baseBudget,
        hypotheticalBudget,
        currentPriority: basePriority,
        hypotheticalPriority: normalizePriority(hypotheticalPriority),
        currentBatteryRequirement: request.requirementProfile?.backupRequired ?? false,
        hypotheticalBatteryRequirement: hypotheticalBattery,
        currentSystemCapacityKw: null,
        hypotheticalSystemCapacityKw: hypotheticalCapacity,
      },
      profileImpact: {
        budgetChanged: hypotheticalBudget !== baseBudget,
        priorityChanged: hypotheticalPriority !== basePriority,
        batteryChanged: hypotheticalBattery !== null,
        capacityChanged: hypotheticalCapacity !== null,
      },
      affectedProposals,
      feasibility: {
        totalProposals: proposalCount,
        feasibleProposals: feasibleCount,
        budgetDelta: hypotheticalBudget !== null && baseBudget !== null ? hypotheticalBudget - baseBudget : null,
        canFitScenario: feasibleCount > 0,
      },
      warnings: [
        hypotheticalBudget !== null && baseBudget !== null && hypotheticalBudget < baseBudget
          ? 'The hypothetical budget is lower than the request budget and may reduce feasibility.'
          : null,
        hypotheticalCapacity !== null && affectedProposals.some((proposal) => proposal.currentCapacity !== null && proposal.currentCapacity < hypotheticalCapacity)
          ? 'Some proposals may not meet the hypothetical capacity target.'
          : null,
        hypotheticalBattery !== null && affectedProposals.some((proposal) => proposal.currentBattery !== null && proposal.currentBattery < hypotheticalBattery)
          ? 'Some proposals may not meet the hypothetical battery target.'
          : null,
      ].filter(Boolean),
      isHypothetical: true,
    }

    let scenarioRecord: { id: string; requestId: string; createdAt: Date } | null = null

    try {
      const createdScenario = await prisma.whatIfScenario.create({
        data: {
          requestId: request.id,
          bidVersionId: request.bids[0].versions[0].id,
          runByUserId: userId,
          parameters: validation.data as Prisma.InputJsonValue,
          hypotheticalResult: resultPayload as Prisma.InputJsonValue,
        },
      })

      scenarioRecord = {
        id: createdScenario.id,
        requestId: createdScenario.requestId,
        createdAt: createdScenario.createdAt,
      }
    } catch (error) {
      throw error
    }

    return res.status(200).json({
      success: true,
      message: 'What-if scenario calculated successfully',
      scenario: scenarioRecord
        ? {
            id: scenarioRecord.id,
            requestId: request.id,
            createdAt: scenarioRecord.createdAt,
          }
        : null,
      result: resultPayload,
    })
  } catch (error) {
    console.error('Run what-if scenario error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to calculate hypothetical scenario',
    })
  }
}

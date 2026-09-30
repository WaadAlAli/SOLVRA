import type { Response } from 'express'
import { Prisma } from '../generated/prisma/client.js'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { prisma } from '../config/prisma.js'
import { extractRequirements } from '../services/ai/requirementExtraction.service.js'
import { confirmRequirementSchema } from '../validators/requirement.validator.js'

export async function analyzeRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId
    const requestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: {
        userId,
      },
    })

    if (!buyerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    const request = await prisma.solarRequest.findFirst({
      where: {
        id: requestId,
        buyerId: buyerProfile.id,
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solar request not found',
      })
    }

    const analysis = await extractRequirements({
      description: request.rawDescription,
      propertyType: request.propertyType,
      monthlyElectricityBill: request.monthlyElectricityBill
        ? Number(request.monthlyElectricityBill)
        : null,
      averageMonthlyConsumption: request.averageMonthlyConsumption
        ? Number(request.averageMonthlyConsumption)
        : null,
      location: request.location,
      roofType: request.roofType,
      ownership: request.ownership,
      budget: request.budget ? Number(request.budget) : null,
      currency: request.currency,
      priority: request.priority,
      timeline: request.timeline,
    })

    return res.status(200).json({
      success: true,
      message: 'Solar requirements analyzed successfully',
      analysis,
    })
  } catch (error) {
    console.error('Analyze request error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to analyze solar requirements',
    })
  }
}

export async function confirmRequirements(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    const requestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required',
      })
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const validation = confirmRequirementSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid confirmed requirements',
        errors: validation.error.flatten(),
      })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: {
        userId,
      },
    })

    if (!buyerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    const request = await prisma.solarRequest.findFirst({
      where: {
        id: requestId,
        buyerId: buyerProfile.id,
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solar request not found',
      })
    }

    const data = validation.data

    if (data.conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          'Requirements contain unresolved conflicts. Please resolve them before confirming.',
        conflicts: data.conflicts,
      })
    }
    const applianceLoad =
      data.applianceLoad === null
        ? Prisma.JsonNull
        : (data.applianceLoad as Prisma.InputJsonValue)

    const usagePattern =
      data.usagePattern === null
        ? Prisma.JsonNull
        : (data.usagePattern as Prisma.InputJsonValue)

    const requirementProfile = await prisma.requirementProfile.upsert({
      where: {
        requestId,
      },

      create: {
        requestId,

        occupantsOrUsers: data.occupantsOrUsers,
        acUnitsCount: data.acUnitsCount,
        applianceLoad,
        usagePattern,

        backupRequired: data.backupRequired,

        currentElectricitySituation: data.currentElectricitySituation,

        goals: data.goals,

        preferences: data.preferences,

        extractionConfidence: data.extractionConfidence,

        confirmedByBuyer: true,
      },

      update: {
        occupantsOrUsers: data.occupantsOrUsers,
        acUnitsCount: data.acUnitsCount,
        applianceLoad,
        usagePattern,

        backupRequired: data.backupRequired,

        currentElectricitySituation: data.currentElectricitySituation,

        goals: data.goals,

        preferences: data.preferences,

        extractionConfidence: data.extractionConfidence,

        confirmedByBuyer: true,
      },
    })

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        requestId,
        action: 'REQUEST_UPDATED',
        metadata: {
          action: 'AI_REQUIREMENTS_CONFIRMED',
          confirmedByBuyer: true,
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Requirements confirmed successfully',
      requirementProfile,
    })
  } catch (error) {
    console.error('Confirm requirements error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to confirm requirements',
    })
  }
}

import type { Response } from 'express'
import { z } from 'zod'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { prisma } from '../config/prisma.js'
import { analyzeRequestInsights } from '../services/ai/insights.service.js'

const requestIdParamSchema = z.object({
  requestId: z.string().uuid('Request ID is invalid'),
})

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

export async function getRequestInsights(
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
        requirementProfile: true,
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
            },
          },
        },
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solar request not found',
      })
    }

    if (!request.bids.length) {
      return res.status(200).json({
        success: true,
        request: {
          id: request.id,
          title: request.title,
          status: request.status,
          location: request.location,
          currency: request.currency,
        },
        insights: {
          summary:
            'No bids have been submitted yet. Once suppliers respond, SOLVRA can summarize how their offers differ and highlight missing information.',
          keyDifferences: [],
          missingInformation: [],
          conflicts: [],
          considerations: [],
          requiresConfirmation: true,
        },
      })
    }

    const payload = {
      request: {
        id: request.id,
        title: request.title,
        status: request.status,
        location: request.location,
        propertyType: request.propertyType,
        rawDescription: request.rawDescription,
        budget: request.budget ? Number(request.budget) : null,
        currency: request.currency,
        monthlyElectricityBill: request.monthlyElectricityBill
          ? Number(request.monthlyElectricityBill)
          : null,
        averageMonthlyConsumption: request.averageMonthlyConsumption
          ? Number(request.averageMonthlyConsumption)
          : null,
        roofType: request.roofType,
        ownership: request.ownership,
        priority: request.priority,
        timeline: request.timeline,
        requirementProfile: request.requirementProfile
          ? {
              confirmedByBuyer: request.requirementProfile.confirmedByBuyer,
              occupantsOrUsers: request.requirementProfile.occupantsOrUsers,
              acUnitsCount: request.requirementProfile.acUnitsCount,
              applianceLoad:
                request.requirementProfile.applianceLoad as Record<string, unknown> | null,
              usagePattern:
                request.requirementProfile.usagePattern as Record<string, unknown> | null,
              backupRequired: request.requirementProfile.backupRequired,
              currentElectricitySituation:
                request.requirementProfile.currentElectricitySituation,
              goals: request.requirementProfile.goals,
              preferences: request.requirementProfile.preferences,
              extractionConfidence: request.requirementProfile.extractionConfidence
                ? Number(request.requirementProfile.extractionConfidence)
                : null,
            }
          : null,
      },
      bids: request.bids.map((bid) => {
        const latestVersion = bid.versions[0] ?? null

        return {
          id: bid.id,
          status: bid.status,
          supplier: {
            companyName: bid.supplier.companyName,
          },
          latestVersion: latestVersion
            ? {
                totalPrice: latestVersion.totalPrice
                  ? Number(latestVersion.totalPrice)
                  : null,
                currency: request.currency,
                panelCapacityKw: latestVersion.panelCapacityKw
                  ? Number(latestVersion.panelCapacityKw)
                  : null,
                batteryCapacityKwh: latestVersion.batteryCapacityKwh
                  ? Number(latestVersion.batteryCapacityKwh)
                  : null,
                batteryType: latestVersion.batteryType,
                inverterSpec: latestVersion.inverterSpec,
                warrantyYears: latestVersion.warrantyYears,
                deliveryTimeDays: latestVersion.deliveryTimeDays,
                paymentTerms: latestVersion.paymentTerms,
                changeSummary: latestVersion.changeSummary,
                equipmentDetails:
                  (latestVersion.equipmentDetails as Record<string, unknown>) ?? null,
              }
            : null,
        }
      }),
    }

    const insights = await analyzeRequestInsights(payload)

    return res.status(200).json({
      success: true,
      request: {
        id: request.id,
        title: request.title,
        status: request.status,
        location: request.location,
        currency: request.currency,
      },
      insights,
    })
  } catch (error) {
    console.error('Get request insights error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch AI insights',
    })
  }
}

export async function getInsightsHealth(
  _req: AuthenticatedRequest,
  res: Response,
) {
  return res.status(200).json({
    success: true,
    message: 'AI insights service is available',
    ready: true,
  })
}

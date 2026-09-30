import type { Response } from 'express'
import { z } from 'zod'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { prisma } from '../config/prisma.js'

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

function getEstimatedAnnualProduction(
  latestVersion: {
    equipmentDetails?: unknown
  } | null,
): number | null {
  if (
    !latestVersion?.equipmentDetails ||
    typeof latestVersion.equipmentDetails !== 'object'
  ) {
    return null
  }

  const details = latestVersion.equipmentDetails as Record<string, unknown>
  const candidateKeys = [
    'estimatedAnnualProduction',
    'annualProduction',
    'estimatedProduction',
    'annualProductionKwh',
    'productionKwh',
  ]

  for (const key of candidateKeys) {
    const value = details[key]
    if (value === null || value === undefined || value === '') {
      continue
    }

    const numeric = Number(value)
    if (Number.isFinite(numeric)) {
      return numeric
    }
  }

  return null
}

function getMissingInformation(
  latestVersion: {
    totalPrice?: unknown
    panelCapacityKw?: unknown
    batteryCapacityKwh?: unknown
    inverterSpec?: string | null
    warrantyYears?: number | null
    paymentTerms?: string | null
    deliveryTimeDays?: number | null
    changeSummary?: string | null
    equipmentDetails?: unknown
  } | null,
): string[] {
  if (!latestVersion) {
    return ['No bid version available']
  }

  const missing: string[] = []

  if (
    latestVersion.totalPrice === null ||
    latestVersion.totalPrice === undefined ||
    latestVersion.totalPrice === ''
  ) {
    missing.push('Price')
  }

  if (
    latestVersion.panelCapacityKw === null ||
    latestVersion.panelCapacityKw === undefined ||
    latestVersion.panelCapacityKw === ''
  ) {
    missing.push('System capacity')
  }

  if (
    latestVersion.batteryCapacityKwh === null ||
    latestVersion.batteryCapacityKwh === undefined ||
    latestVersion.batteryCapacityKwh === ''
  ) {
    missing.push('Battery storage')
  }

  if (!latestVersion.inverterSpec) {
    missing.push('Inverter')
  }

  if (
    latestVersion.warrantyYears === null ||
    latestVersion.warrantyYears === undefined
  ) {
    missing.push('Warranty')
  }

  const details =
    typeof latestVersion.equipmentDetails === 'object' &&
    latestVersion.equipmentDetails !== null
      ? (latestVersion.equipmentDetails as Record<string, unknown>)
      : {}

  const production = [
    details.estimatedAnnualProduction,
    details.annualProduction,
    details.estimatedProduction,
    details.annualProductionKwh,
    details.productionKwh,
  ].some((entry) => entry !== null && entry !== undefined && entry !== '')

  if (!production) {
    missing.push('Estimated annual production')
  }

  if (
    latestVersion.deliveryTimeDays === null ||
    latestVersion.deliveryTimeDays === undefined
  ) {
    missing.push('Installation timeline')
  }

  if (!latestVersion.paymentTerms) {
    missing.push('Payment terms')
  }

  if (!latestVersion.changeSummary) {
    missing.push('Supplier notes')
  }

  return missing
}

export async function getRequestComparison(
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
        bids: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            supplier: {
              select: {
                id: true,
                companyName: true,
                serviceAreas: true,
                certifications: true,
                verifiedByAdmin: true,
              },
            },
            versions: {
              orderBy: {
                versionNumber: 'desc',
              },
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

    const comparisonBids = request.bids.map((bid) => {
      const latestVersion = bid.versions[0] ?? null

      return {
        id: bid.id,
        status: bid.status,
        supplier: {
          id: bid.supplier.id,
          companyName: bid.supplier.companyName,
          certifications: bid.supplier.certifications,
          serviceAreas: bid.supplier.serviceAreas,
          verifiedByAdmin: bid.supplier.verifiedByAdmin,
        },
        version: latestVersion
          ? {
              id: latestVersion.id,
              versionNumber: latestVersion.versionNumber,
              createdAt: latestVersion.createdAt,
            }
          : null,
        currency: request.currency ?? null,
        totalPrice: latestVersion ? toNumber(latestVersion.totalPrice) : null,
        systemCapacity: latestVersion
          ? toNumber(latestVersion.panelCapacityKw)
          : null,
        batteryStorageKwh: latestVersion
          ? toNumber(latestVersion.batteryCapacityKwh)
          : null,
        inverter: latestVersion?.inverterSpec ?? null,
        warrantyYears: latestVersion?.warrantyYears ?? null,
        estimatedAnnualProduction: getEstimatedAnnualProduction(latestVersion),
        installationTimelineDays: latestVersion?.deliveryTimeDays ?? null,
        paymentTerms: latestVersion?.paymentTerms ?? null,
        supplierNotes: latestVersion?.changeSummary ?? null,
        missingInformation: getMissingInformation(latestVersion),
      }
    })

    return res.status(200).json({
      success: true,
      request: {
        id: request.id,
        title: request.title,
        status: request.status,
        location: request.location,
        currency: request.currency,
      },
      bids: comparisonBids,
    })
  } catch (error) {
    console.error('Get request comparison error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch request comparison',
    })
  }
}

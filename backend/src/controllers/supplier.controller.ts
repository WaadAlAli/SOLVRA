import type { Response } from 'express'
import { Prisma } from '../generated/prisma/client.js'
import { z } from 'zod'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { prisma } from '../config/prisma.js'

const requestIdParamSchema = z.object({
  requestId: z.string().uuid('Request ID is invalid'),
})

const bidIdParamSchema = z.object({
  bidId: z.string().uuid('Bid ID is invalid'),
})

const createBidSchema = z.object({
  title: z.string().trim().min(2).max(200),
  panelCapacityKw: z.coerce.number().positive('Panel capacity must be greater than zero'),
  batteryCapacityKwh: z.coerce.number().nonnegative().optional().nullable(),
  batteryType: z.string().trim().max(200).optional().nullable(),
  inverterSpec: z.string().trim().max(200).optional().nullable(),
  equipmentDetails: z.any().optional().nullable(),
  installationCost: z.coerce.number().nonnegative('Installation cost must be zero or greater'),
  deliveryCost: z.coerce.number().nonnegative('Delivery cost must be zero or greater'),
  commissioningCost: z.coerce.number().nonnegative('Commissioning cost must be zero or greater'),
  maintenanceCost: z.coerce.number().nonnegative().optional().nullable(),
  warrantyYears: z.coerce.number().int().min(0).optional().nullable(),
  deliveryTimeDays: z.coerce.number().int().min(0).optional().nullable(),
  paymentTerms: z.string().trim().max(500).optional().nullable(),
  totalPrice: z.coerce.number().nonnegative('Total price must be zero or greater'),
  extractionSource: z.enum(['MANUAL_ENTRY', 'AI_EXTRACTED']).default('MANUAL_ENTRY'),
  extractionConfirmed: z.boolean().default(true),
  changeSummary: z.string().trim().max(1000).optional().nullable(),
})

const createBidVersionSchema = z.object({
  panelCapacityKw: z.coerce.number().positive('Panel capacity must be greater than zero'),
  batteryCapacityKwh: z.coerce.number().nonnegative().optional().nullable(),
  batteryType: z.string().trim().max(200).optional().nullable(),
  inverterSpec: z.string().trim().max(200).optional().nullable(),
  equipmentDetails: z.any().optional().nullable(),
  installationCost: z.coerce.number().nonnegative('Installation cost must be zero or greater'),
  deliveryCost: z.coerce.number().nonnegative('Delivery cost must be zero or greater'),
  commissioningCost: z.coerce.number().nonnegative('Commissioning cost must be zero or greater'),
  maintenanceCost: z.coerce.number().nonnegative().optional().nullable(),
  warrantyYears: z.coerce.number().int().min(0).optional().nullable(),
  deliveryTimeDays: z.coerce.number().int().min(0).optional().nullable(),
  paymentTerms: z.string().trim().max(500).optional().nullable(),
  totalPrice: z.coerce.number().nonnegative('Total price must be zero or greater'),
  extractionSource: z.enum(['MANUAL_ENTRY', 'AI_EXTRACTED']).default('MANUAL_ENTRY'),
  extractionConfirmed: z.boolean().default(true),
  changeSummary: z.string().trim().max(1000).optional().nullable(),
})

async function getSupplierProfileByUserId(userId: string) {
  return prisma.supplierProfile.findUnique({
    where: { userId },
  })
}

export async function getSupplierProfile(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const profile = await prisma.supplierProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Supplier profile not found',
      })
    }

    return res.status(200).json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Get supplier profile error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier profile',
    })
  }
}

export async function updateSupplierProfile(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const validation = z.object({
      companyName: z.string().trim().min(2).max(200).optional(),
      serviceAreas: z.array(z.string().trim().min(1).max(100)).optional(),
      capabilities: z.array(z.string().trim().min(1).max(100)).optional(),
      certifications: z.string().trim().max(1000).nullable().optional(),
    }).safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier profile data',
        errors: validation.error.flatten(),
      })
    }

    const profile = await prisma.supplierProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Supplier profile not found',
      })
    }

    const updatedProfile = await prisma.supplierProfile.update({
      where: { userId },
      data: {
        ...validation.data,
        companyName: validation.data.companyName?.trim() || profile.companyName,
        serviceAreas: validation.data.serviceAreas ?? profile.serviceAreas,
        capabilities: validation.data.capabilities ?? profile.capabilities,
        certifications:
          validation.data.certifications === undefined
            ? profile.certifications
            : validation.data.certifications,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Supplier profile updated successfully',
      profile: updatedProfile,
    })
  } catch (error) {
    console.error('Update supplier profile error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update supplier profile',
    })
  }
}

export async function getSupplierDashboard(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const supplierProfile = await getSupplierProfileByUserId(userId)

    if (!supplierProfile) {
      return res.status(403).json({
        success: false,
        message: 'Supplier profile not found',
      })
    }

    const [openRequests, myBids] = await Promise.all([
      prisma.solarRequest.count({
        where: { status: 'OPEN' },
      }),
      prisma.bid.findMany({
        where: { supplierId: supplierProfile.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          request: {
            select: {
              id: true,
              title: true,
              status: true,
              location: true,
            },
          },
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      }),
    ])

    return res.status(200).json({
      success: true,
      stats: {
        openRequests,
        activeBids: myBids.length,
      },
      recentBids: myBids,
    })
  } catch (error) {
    console.error('Get supplier dashboard error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to load supplier dashboard',
    })
  }
}

export async function getOpenRequests(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const supplierProfile = await getSupplierProfileByUserId(userId)

    if (!supplierProfile) {
      return res.status(403).json({
        success: false,
        message: 'Supplier profile not found',
      })
    }

    const requests = await prisma.solarRequest.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      include: {
        requirementProfile: true,
        _count: {
          select: {
            bids: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      requests,
      supplier: {
        id: supplierProfile.id,
        companyName: supplierProfile.companyName,
      },
    })
  } catch (error) {
    console.error('Get open requests error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch open solar requests',
    })
  }
}

export async function getOpenRequestById(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const supplierProfile = await getSupplierProfileByUserId(userId)

    if (!supplierProfile) {
      return res.status(403).json({
        success: false,
        message: 'Supplier profile not found',
      })
    }

    const paramResult = requestIdParamSchema.safeParse({
      requestId: Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id,
    })

    if (!paramResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is invalid',
        errors: paramResult.error.flatten(),
      })
    }

    const request = await prisma.solarRequest.findFirst({
      where: {
        id: paramResult.data.requestId,
        status: 'OPEN',
      },
      include: {
        requirementProfile: true,
        bids: {
          select: {
            id: true,
            status: true,
            supplier: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Open solar request not found',
      })
    }

    return res.status(200).json({
      success: true,
      request,
      supplier: {
        id: supplierProfile.id,
        companyName: supplierProfile.companyName,
      },
    })
  } catch (error) {
    console.error('Get open request by id error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch solar request details',
    })
  }
}

export async function createSupplierBid(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const paramResult = requestIdParamSchema.safeParse({
      requestId: Array.isArray(req.params.requestId)
        ? req.params.requestId[0]
        : req.params.requestId,
    })

    if (!paramResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is invalid',
        errors: paramResult.error.flatten(),
      })
    }

    const validation = createBidSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bid data',
        errors: validation.error.flatten(),
      })
    }

    const supplierProfile = await getSupplierProfileByUserId(userId)

    if (!supplierProfile) {
      return res.status(403).json({
        success: false,
        message: 'Supplier profile not found',
      })
    }

    const request = await prisma.solarRequest.findUnique({
      where: { id: paramResult.data.requestId },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solar request not found',
      })
    }

    if (request.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: 'Only open solar requests can receive bids',
      })
    }

    const bid = await prisma.bid.create({
      data: {
        requestId: request.id,
        supplierId: supplierProfile.id,
        title: validation.data.title,
        status: 'SUBMITTED',
        versions: {
          create: {
            versionNumber: 1,
            panelCapacityKw: validation.data.panelCapacityKw,
            batteryCapacityKwh: validation.data.batteryCapacityKwh ?? null,
            batteryType: validation.data.batteryType ?? null,
            inverterSpec: validation.data.inverterSpec ?? null,
            equipmentDetails:
              validation.data.equipmentDetails === undefined
                ? undefined
                : validation.data.equipmentDetails === null
                  ? Prisma.JsonNull
                  : (validation.data.equipmentDetails as Prisma.InputJsonValue),
            installationCost: validation.data.installationCost,
            deliveryCost: validation.data.deliveryCost,
            commissioningCost: validation.data.commissioningCost,
            maintenanceCost: validation.data.maintenanceCost ?? null,
            warrantyYears: validation.data.warrantyYears ?? null,
            deliveryTimeDays: validation.data.deliveryTimeDays ?? null,
            paymentTerms: validation.data.paymentTerms ?? null,
            totalPrice: validation.data.totalPrice,
            extractionSource: validation.data.extractionSource,
            extractionConfirmed: validation.data.extractionConfirmed,
            changeSummary: validation.data.changeSummary ?? null,
          },
        },
      },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            location: true,
            status: true,
            propertyType: true,
          },
        },
      },
    })

    const freshBid = await prisma.bid.findUnique({
      where: { id: bid.id },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            location: true,
            status: true,
            propertyType: true,
            budget: true,
            createdAt: true,
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: { documents: true },
        },
      },
    })

    if (!freshBid) {
      return res.status(404).json({
        success: false,
        message: 'Submitted bid could not be loaded',
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      bid: {
        ...freshBid,
        latestVersion: freshBid.versions[0] ?? null,
      },
    })
  } catch (error) {
    console.error('Create supplier bid error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to submit bid',
    })
  }
}

export async function createSupplierBidVersion(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const paramResult = bidIdParamSchema.safeParse({
      bidId: Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id,
    })

    if (!paramResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Bid ID is invalid',
        errors: paramResult.error.flatten(),
      })
    }

    const validation = createBidVersionSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bid version data',
        errors: validation.error.flatten(),
      })
    }

    const supplierProfile = await getSupplierProfileByUserId(userId)

    if (!supplierProfile) {
      return res.status(403).json({
        success: false,
        message: 'Supplier profile not found',
      })
    }

    const bid = await prisma.bid.findFirst({
      where: {
        id: paramResult.data.bidId,
        supplierId: supplierProfile.id,
      },
      include: {
        request: {
          select: {
            id: true,
            status: true,
          },
        },
        versions: {
          orderBy: {
            versionNumber: 'desc',
          },
          take: 1,
        },
      },
    })

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      })
    }

    if (
      bid.status === 'AWARDED' ||
      bid.status === 'REJECTED' ||
      bid.status === 'WITHDRAWN'
    ) {
      return res.status(409).json({
        success: false,
        message: 'This bid can no longer be revised',
      })
    }

    if (
      bid.request.status === 'AWARDED' ||
      bid.request.status === 'CLOSED'
    ) {
      return res.status(409).json({
        success: false,
        message: 'This request is no longer accepting bid revisions',
      })
    }

    const latestVersionNumber = bid.versions[0]?.versionNumber ?? 0
    const nextVersionNumber = latestVersionNumber + 1

    const version = await prisma.bidVersion.create({
      data: {
        bidId: bid.id,
        versionNumber: nextVersionNumber,

        panelCapacityKw: validation.data.panelCapacityKw,
        batteryCapacityKwh: validation.data.batteryCapacityKwh ?? null,
        batteryType: validation.data.batteryType ?? null,
        inverterSpec: validation.data.inverterSpec ?? null,

        equipmentDetails:
          validation.data.equipmentDetails === undefined
            ? undefined
            : validation.data.equipmentDetails === null
              ? Prisma.JsonNull
              : (validation.data.equipmentDetails as Prisma.InputJsonValue),

        installationCost: validation.data.installationCost,
        deliveryCost: validation.data.deliveryCost,
        commissioningCost: validation.data.commissioningCost,
        maintenanceCost: validation.data.maintenanceCost ?? null,
        warrantyYears: validation.data.warrantyYears ?? null,
        deliveryTimeDays: validation.data.deliveryTimeDays ?? null,
        paymentTerms: validation.data.paymentTerms ?? null,
        totalPrice: validation.data.totalPrice,

        extractionSource: validation.data.extractionSource,
        extractionConfirmed: validation.data.extractionConfirmed,
        changeSummary: validation.data.changeSummary ?? null,
      },
    })

    await prisma.bid.update({
      where: { id: bid.id },
      data: {
        status: 'REVISED',
      },
    })

    const freshBid = await prisma.bid.findUnique({
      where: { id: bid.id },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            location: true,
            status: true,
            propertyType: true,
            budget: true,
            createdAt: true,
          },
        },
        versions: {
          orderBy: {
            versionNumber: 'desc',
          },
          include: {
            documents: true,
          },
        },
      },
    })

    return res.status(201).json({
      success: true,
      message: `Bid version ${version.versionNumber} submitted successfully`,
      bid: freshBid
        ? {
            ...freshBid,
            latestVersion: freshBid.versions[0] ?? null,
          }
        : null,
    })
  } catch (error) {
    console.error('Create supplier bid version error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to submit bid revision',
    })
  }
}

export async function getMyBids(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const supplierProfile = await getSupplierProfileByUserId(userId)

    if (!supplierProfile) {
      return res.status(403).json({
        success: false,
        message: 'Supplier profile not found',
      })
    }

    const bids = await prisma.bid.findMany({
      where: { supplierId: supplierProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            location: true,
            status: true,
            propertyType: true,
            budget: true,
            createdAt: true,
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: { documents: true },
        },
      },
    })

    return res.status(200).json({
      success: true,
      bids: bids.map((bid) => ({
        ...bid,
        latestVersion: bid.versions[0] ?? null,
      })),
    })
  } catch (error) {
    console.error('Get my bids error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your bids',
    })
  }
}

export async function getMyBidById(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const supplierProfile = await getSupplierProfileByUserId(userId)

    if (!supplierProfile) {
      return res.status(403).json({
        success: false,
        message: 'Supplier profile not found',
      })
    }

    const paramResult = bidIdParamSchema.safeParse({
      bidId: Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id,
    })

    if (!paramResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Bid ID is invalid',
        errors: paramResult.error.flatten(),
      })
    }

    const bid = await prisma.bid.findFirst({
      where: {
        id: paramResult.data.bidId,
        supplierId: supplierProfile.id,
      },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            location: true,
            status: true,
            propertyType: true,
            budget: true,
            createdAt: true,
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: { documents: true },
        },
      },
    })

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      })
    }

    return res.status(200).json({
      success: true,
      bid: {
        ...bid,
        latestVersion: bid.versions[0] ?? null,
      },
    })
  } catch (error) {
    console.error('Get bid by id error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bid details',
    })
  }
}

import type { Response } from 'express'
import { z } from 'zod'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'

import { prisma } from '../config/prisma.js'
import { createRequestSchema ,updateRequestSchema } from '../validators/request.validator.js'

const requestIdParamSchema = z.object({
  id: z.string().uuid('Request ID is invalid'),
})

const bidIdParamSchema = z.object({
  bidId: z.string().uuid('Bid ID is invalid'),
})


export async function createRequest(
  req: AuthenticatedRequest,
  res: Response,
){
  try {
    const validation = createRequestSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.flatten(),
      })
    }

    const data = validation.data

    const userId = req.user?.userId

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

    const budget =
      data.budgetMax ?? data.budgetMin

    const request = await prisma.solarRequest.create({
      data: {
        buyerId: buyerProfile.id,

        title: data.title,
        propertyType: data.propertyType,
        location: data.location,

        status: data.status,

        budget,
        currency: data.currency,

        rawDescription: data.rawDescription,

        monthlyElectricityBill:
          data.monthlyElectricityBill,

        averageMonthlyConsumption:
          data.averageMonthlyConsumption,

        roofType: data.roofType,
        ownership: data.ownership,
        priority: data.priority,
        timeline: data.timeline,

        activityLogs: {
          create: {
            actorId: userId,
            action: 'REQUEST_CREATED',
            metadata: {
              status: data.status,
            },
          },
        },
      },

      include: {
        requirementProfile: true,
      },
    })

    return res.status(201).json({
      success: true,
      message:
        data.status === 'OPEN'
          ? 'Solar request opened successfully'
          : 'Solar request saved as draft',
      request,
    })
  } catch (error) {
    console.error('Create request error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create solar request',
    })
  }
}

export async function getMyRequests(
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

    const buyerProfile =
      await prisma.buyerProfile.findUnique({
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

    const requests =
      await prisma.solarRequest.findMany({
        where: {
          buyerId: buyerProfile.id,
        },

        orderBy: {
          createdAt: 'desc',
        },

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
    })
  } catch (error) {
    console.error('Get requests error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch solar requests',
    })
  }
}

export async function getRequestById(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const buyerProfile =
      await prisma.buyerProfile.findUnique({
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

    const request =
      await prisma.solarRequest.findFirst({
        where: {
          id,
          buyerId: buyerProfile.id,
        },

        include: {
          requirementProfile: true,
          bids: {
            include: {
              supplier: true,
              versions: true,
            },
          },
          evaluationCriteria: true,
          evaluationResults: true,
          activityLogs: {
            orderBy: {
              createdAt: 'desc',
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

    return res.status(200).json({
      success: true,
      request,
    })
  } catch (error) {
    console.error('Get request error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch solar request',
    })
  }
}

export async function getRequestBids(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId
    const paramResult = requestIdParamSchema.safeParse({
      id: Array.isArray(req.params.id)
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
        id: paramResult.data.id,
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
              include: {
                documents: true,
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

    return res.status(200).json({
      success: true,
      request: {
        id: request.id,
        title: request.title,
        status: request.status,
        location: request.location,
      },
      bids: request.bids.map((bid) => ({
        ...bid,
        latestVersion: bid.versions[0] ?? null,
      })),
    })
  } catch (error) {
    console.error('Get request bids error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch request bids',
    })
  }
}

export async function getRequestBidById(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId
    const requestParamResult = requestIdParamSchema.safeParse({
      id: Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id,
    })
    const bidParamResult = bidIdParamSchema.safeParse({
      bidId: Array.isArray(req.params.bidId)
        ? req.params.bidId[0]
        : req.params.bidId,
    })

    if (!requestParamResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is invalid',
        errors: requestParamResult.error.flatten(),
      })
    }

    if (!bidParamResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Bid ID is invalid',
        errors: bidParamResult.error.flatten(),
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

    const bid = await prisma.bid.findFirst({
      where: {
        id: bidParamResult.data.bidId,
        requestId: requestParamResult.data.id,
        request: {
          buyerId: buyerProfile.id,
        },
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
          include: {
            documents: true,
          },
        },
      },
    })

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      })
    }

    const request = await prisma.solarRequest.findUnique({
      where: { id: requestParamResult.data.id },
      select: {
        id: true,
        title: true,
        status: true,
        location: true,
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solar request not found',
      })
    }

    return res.status(200).json({
      success: true,
      request,
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

export async function updateRequest(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    if (!id) {
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

    const validation = updateRequestSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
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
        id,
        buyerId: buyerProfile.id,
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solar request not found',
      })
    }

    if (request.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Only draft requests can be edited',
      })
    }

    const data = validation.data

    const updatedRequest = await prisma.solarRequest.update({
      where: { id },

      data: {
        ...(data.title !== undefined && {
          title: data.title,
        }),

        ...(data.propertyType !== undefined && {
          propertyType: data.propertyType,
        }),

        ...(data.location !== undefined && {
          location: data.location,
        }),

        ...(data.rawDescription !== undefined && {
          rawDescription: data.rawDescription,
        }),

        ...(data.currency !== undefined && {
          currency: data.currency,
        }),

        ...(data.monthlyElectricityBill !== undefined && {
          monthlyElectricityBill:
            data.monthlyElectricityBill,
        }),

        ...(data.averageMonthlyConsumption !== undefined && {
          averageMonthlyConsumption:
            data.averageMonthlyConsumption,
        }),

        ...(data.roofType !== undefined && {
          roofType: data.roofType,
        }),

        ...(data.ownership !== undefined && {
          ownership: data.ownership,
        }),

        ...(data.budgetMax !== undefined && {
          budget: data.budgetMax,
        }),

        ...(data.priority !== undefined && {
          priority: data.priority,
        }),

        ...(data.timeline !== undefined && {
          timeline: data.timeline,
        }),
      },

      include: {
        requirementProfile: true,
      },
    })

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        requestId: id,
        action: 'REQUEST_UPDATED',
        metadata: {
          action: 'REQUEST_EDITED',
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Solar request updated successfully',
      request: updatedRequest,
    })
  } catch (error) {
    console.error('Update request error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update solar request',
    })
  }
}

export async function deleteRequest(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    if (!id) {
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
        id,
        buyerId: buyerProfile.id,
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solar request not found',
      })
    }

    if (request.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Only draft requests can be deleted',
      })
    }

    await prisma.solarRequest.delete({
      where: { id },
    })

    return res.status(200).json({
      success: true,
      message: 'Draft request deleted successfully',
    })
  } catch (error) {
    console.error('Delete request error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to delete solar request',
    })
  }
}
export async function openRequest(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId = req.user?.userId

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    if (!id) {
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
        id,
        buyerId: buyerProfile.id,
      },
      include: {
        requirementProfile: true,
      },
    })

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solar request not found',
      })
    }

    if (request.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Only draft requests can be opened',
      })
    }

    if (!request.requirementProfile) {
      return res.status(400).json({
        success: false,
        message: 'Requirements must be confirmed before opening the request',
      })
    }

    if (!request.requirementProfile.confirmedByBuyer) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm the AI requirements before opening the request',
      })
    }

    const updatedRequest = await prisma.solarRequest.update({
      where: { id },

      data: {
        status: 'OPEN',
      },

      include: {
        requirementProfile: true,
      },
    })

    await prisma.activityLog.create({
      data: {
        actorId: userId,
        requestId: id,
        action: 'REQUEST_STATUS_CHANGED',
        metadata: {
          from: 'DRAFT',
          to: 'OPEN',
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Solar request opened successfully',
      request: updatedRequest,
    })
  } catch (error) {
    console.error('Open request error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to open solar request',
    })
  }
}
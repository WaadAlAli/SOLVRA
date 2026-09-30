import type { Response } from 'express'
import { z } from 'zod'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { prisma } from '../config/prisma.js'

const requestIdParamSchema = z.object({
  id: z.string().uuid('Request ID is invalid'),
})

const bidIdParamSchema = z.object({
  bidId: z.string().uuid('Bid ID is invalid'),
})

export async function getRequestBids(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId
    const paramResult = requestIdParamSchema.safeParse({
      id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
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
      id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
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

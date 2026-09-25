import type { Response } from 'express'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { prisma } from '../config/prisma.js'

export async function getBuyerDashboard(
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

    const [
      totalRequests,
      draftRequests,
      openRequests,
      evaluatingRequests,
      negotiatingRequests,
      awardedRequests,
      recentRequests,
      recentActivity,
    ] = await Promise.all([
      prisma.solarRequest.count({
        where: {
          buyerId: buyerProfile.id,
        },
      }),

      prisma.solarRequest.count({
        where: {
          buyerId: buyerProfile.id,
          status: 'DRAFT',
        },
      }),

      prisma.solarRequest.count({
        where: {
          buyerId: buyerProfile.id,
          status: 'OPEN',
        },
      }),

      prisma.solarRequest.count({
        where: {
          buyerId: buyerProfile.id,
          status: 'EVALUATING',
        },
      }),

      prisma.solarRequest.count({
        where: {
          buyerId: buyerProfile.id,
          status: 'NEGOTIATING',
        },
      }),

      prisma.solarRequest.count({
        where: {
          buyerId: buyerProfile.id,
          status: 'AWARDED',
        },
      }),

      prisma.solarRequest.findMany({
        where: {
          buyerId: buyerProfile.id,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 5,
        include: {
          requirementProfile: true,
          _count: {
            select: {
              bids: true,
            },
          },
        },
      }),

      prisma.activityLog.findMany({
        where: {
          actorId: userId,
          request: {
            buyerId: buyerProfile.id,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 8,
      }),
    ])

    return res.status(200).json({
      success: true,

      stats: {
        totalRequests,
        draftRequests,
        openRequests,
        evaluatingRequests,
        negotiatingRequests,
        awardedRequests,
      },

      recentRequests,

      recentActivity,
    })
  } catch (error) {
    console.error('Buyer dashboard error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch buyer dashboard',
    })
  }
}
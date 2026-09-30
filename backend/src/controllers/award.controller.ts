import type { Response } from 'express'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { prisma } from '../config/prisma.js'

export async function awardBid(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId
    const requestId =
      typeof req.params.requestId === 'string' ? req.params.requestId : null

    const { bidVersionId } = req.body

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!requestId || !bidVersionId) {
      return res.status(400).json({
        success: false,
        message: 'requestId and bidVersionId are required',
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
        message: 'Request not found',
      })
    }

    if (request.status === 'AWARDED') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been awarded',
      })
    }

    if (request.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'This request is closed',
      })
    }

    if (request.status !== 'EVALUATING' && request.status !== 'NEGOTIATING') {
      return res.status(400).json({
        success: false,
        message:
          'A request must be in evaluation or negotiation before it can be awarded',
      })
    }

    const bidVersion = await prisma.bidVersion.findUnique({
      where: {
        id: bidVersionId,
      },
      include: {
        bid: true,
      },
    })

    if (!bidVersion) {
      return res.status(404).json({
        success: false,
        message: 'Bid version not found',
      })
    }

    if (bidVersion.bid.requestId !== requestId) {
      return res.status(400).json({
        success: false,
        message: 'Selected bid does not belong to this request',
      })
    }

    if (
      bidVersion.bid.status === 'WITHDRAWN' ||
      bidVersion.bid.status === 'REJECTED'
    ) {
      return res.status(400).json({
        success: false,
        message: 'This bid cannot be awarded',
      })
    }

    const existingAward = await prisma.award.findUnique({
      where: {
        requestId,
      },
    })

    if (existingAward) {
      return res.status(400).json({
        success: false,
        message: 'This request has already been awarded',
      })
    }

    const award = await prisma.$transaction(async (tx) => {
      const createdAward = await tx.award.create({
        data: {
          requestId,
          bidVersionId,
          awardedByUserId: userId,
        },
      })

      await tx.bid.update({
        where: {
          id: bidVersion.bidId,
        },
        data: {
          status: 'AWARDED',
        },
      })

      await tx.solarRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: 'AWARDED',
        },
      })

      await tx.activityLog.create({
        data: {
          actorId: userId,
          requestId,
          bidId: bidVersion.bidId,
          action: 'AWARD_MADE',
          metadata: {
            bidVersionId,
            awardId: createdAward.id,
          },
        },
      })

      return createdAward
    })

    return res.status(201).json({
      success: true,
      message: 'Bid awarded successfully',
      award,
    })
  } catch (error) {
    console.error('Award bid error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to award bid',
    })
  }
}

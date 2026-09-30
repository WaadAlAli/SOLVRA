import type { Response } from 'express'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { prisma } from '../config/prisma.js'
import { updateBuyerProfileSchema } from '../validators/buyerProfile.validator.js'

export async function getBuyerProfile(
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

    if (!buyerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    return res.status(200).json({
      success: true,
      profile: buyerProfile,
    })
  } catch (error) {
    console.error('Get buyer profile error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch buyer profile',
    })
  }
}

export async function updateBuyerProfile(
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

    const validation = updateBuyerProfileSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile data',
        errors: validation.error.flatten(),
      })
    }

    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
    })

    if (!buyerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Buyer profile not found',
      })
    }

    const data = validation.data

    const updatedProfile = await prisma.buyerProfile.update({
      where: {
        userId,
      },
      data,
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
      message: 'Buyer profile updated successfully',
      profile: updatedProfile,
    })
  } catch (error) {
    console.error('Update buyer profile error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update buyer profile',
    })
  }
}

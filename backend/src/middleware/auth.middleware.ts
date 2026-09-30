import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'
import { prisma } from '../config/prisma.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    role: 'BUYER' | 'SUPPLIER' | 'ADMIN'
  }
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies.solvra_token

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    })
    return
  }

  try {
    const payload = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Your account is inactive or no longer exists.',
      })
      return
    }

    req.user = {
      userId: user.id,
      role: user.role,
    }

    next()
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication.',
    })
  }
}

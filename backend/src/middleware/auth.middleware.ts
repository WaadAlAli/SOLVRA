import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    role: 'BUYER' | 'SUPPLIER' | 'ADMIN'
  }
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
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

    req.user = payload
    next()
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication.',
    })
  }
}
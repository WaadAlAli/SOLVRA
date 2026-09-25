import type { Request, Response } from 'express'

import { prisma } from '../config/prisma.js'
import {
  loginUser,
  registerUser,
} from '../services/auth.service.js'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js'
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import {
  requestPasswordReset,
  resetPassword,
} from '../services/password-reset.service.js'

import { sendPasswordResetEmail } from '../services/email.service.js'

const isProduction = process.env.NODE_ENV === 'production'

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}

export async function register(
  req: Request,
  res: Response,
): Promise<void> {
  const validation = registerSchema.safeParse(req.body)

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: 'Please check the provided information.',
      errors: validation.error.flatten().fieldErrors,
    })
    return
  }

  try {
    const result = await registerUser(validation.data)

    res.cookie(
      'solvra_token',
      result.accessToken,
      authCookieOptions,
    )

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: result.user,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'EMAIL_ALREADY_EXISTS'
    ) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      })
      return
    }

    console.error('Registration error:', error)

    res.status(500).json({
      success: false,
      message: 'Unable to create your account right now.',
    })
  }
}

export async function login(
  req: Request,
  res: Response,
): Promise<void> {
  const validation = loginSchema.safeParse(req.body)

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: 'Please check your email and password.',
      errors: validation.error.flatten().fieldErrors,
    })
    return
  }

  try {
    const result = await loginUser(validation.data)

    res.cookie(
      'solvra_token',
      result.accessToken,
      authCookieOptions,
    )

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: result.user,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'ACCOUNT_INACTIVE'
    ) {
      res.status(403).json({
        success: false,
        message: 'This account is currently inactive.',
      })
      return
    }

    if (
      error instanceof Error &&
      error.message === 'INVALID_CREDENTIALS'
    ) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
      return
    }

    console.error('Login error:', error)

    res.status(500).json({
      success: false,
      message: 'Unable to sign you in right now.',
    })
  }
}

export async function me(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    })
    return
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.userId,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      buyerProfile: {
        select: {
          displayName: true,
        },
      },
      supplierProfile: {
        select: {
          companyName: true,
        },
      },
    },
  })

  if (!user || !user.isActive) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    })
    return
  }

  res.status(200).json({
    success: true,
    user: {
      ...user,
      displayName:
        user.buyerProfile?.displayName ??
        user.supplierProfile?.companyName ??
        null,
      companyName: user.supplierProfile?.companyName ?? null,
    },
  })
}

export function logout(
  _req: Request,
  res: Response,
): void {
  res.clearCookie('solvra_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  })

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  })
}
export async function forgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  
  const validation =
    forgotPasswordSchema.safeParse(req.body)

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    })
    return
  }

  try {
    const result = await requestPasswordReset(
      validation.data,
    )

    if (result.resetToken) {
      await sendPasswordResetEmail(
        validation.data.email,
        result.resetToken,
      )
    }

    // Deliberately identical whether the email exists or not.
    res.status(200).json({
      success: true,
      message:
        'If an account exists for that email, a password reset link has been sent.',
    })
  } catch (error) {
    console.error(
      'Forgot password error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Unable to process your request right now.',
    })
  }
}

export async function resetPasswordHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const validation =
    resetPasswordSchema.safeParse(req.body)

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: 'Please check your password information.',
      errors:
        validation.error.flatten().fieldErrors,
    })
    return
  }

  try {
    await resetPassword(validation.data)

    res.status(200).json({
      success: true,
      message:
        'Password reset successfully. You can now sign in.',
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'INVALID_RESET_TOKEN'
    ) {
      res.status(400).json({
        success: false,
        message:
          'This password reset link is invalid or has expired.',
      })
      return
    }

    console.error(
      'Reset password error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Unable to reset your password right now.',
    })
  }
}
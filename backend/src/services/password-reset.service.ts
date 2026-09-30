import { prisma } from '../config/prisma.js'
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from '../utils/password-reset.js'
import { hashPassword } from '../utils/password.js'
import type {
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validators/auth.validator.js'

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  })

  // Always return the same result whether the account exists or not.
  if (!user || !user.isActive) {
    return {
      resetToken: null,
    }
  }

  // Invalidate previous unused tokens for this user.
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  })

  const { rawToken, tokenHash, expiresAt } = generatePasswordResetToken()

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  })

  return {
    resetToken: rawToken,
  }
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashPasswordResetToken(input.token)

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
  })

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
    throw new Error('INVALID_RESET_TOKEN')
  }

  const passwordHash = await hashPassword(input.password)

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        passwordHash,
      },
    })

    await tx.passwordResetToken.update({
      where: {
        id: resetToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    })

    // Invalidate any other outstanding reset tokens.
    await tx.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
        id: {
          not: resetToken.id,
        },
      },
      data: {
        usedAt: new Date(),
      },
    })
  })
}

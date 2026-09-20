import { prisma } from '../config/prisma.js'
import { comparePassword ,hashPassword } from '../utils/password.js'
import { generateAccessToken } from '../utils/jwt.js'
import type {LoginInput,RegisterInput } from '../validators/auth.validator.js'

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  })

  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS')
  }

  const passwordHash = await hashPassword(input.password)

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: input.role,
      },
    })

    if (input.role === 'BUYER') {
      await tx.buyerProfile.create({
        data: {
          userId: createdUser.id,
          buyerType: input.buyerType!,
          displayName: input.displayName,
          location: input.location!,
          phone: input.phone,
        },
      })
    }

    if (input.role === 'SUPPLIER') {
      await tx.supplierProfile.create({
        data: {
          userId: createdUser.id,
          companyName: input.companyName!,
          serviceAreas: [],
          capabilities: [],
        },
      })
    }

    return createdUser
  })

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  })

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  }
}
export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  })

  if (!user) {
    throw new Error('INVALID_CREDENTIALS')
  }

  if (!user.isActive) {
    throw new Error('ACCOUNT_INACTIVE')
  }

  const passwordIsValid = await comparePassword(
    input.password,
    user.passwordHash,
  )

  if (!passwordIsValid) {
    throw new Error('INVALID_CREDENTIALS')
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  })

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  }
}

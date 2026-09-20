import jwt, { type SignOptions } from 'jsonwebtoken'

export interface AuthTokenPayload {
  userId: string
  role: 'BUYER' | 'SUPPLIER' | 'ADMIN'
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }

  return secret
}

export function generateAccessToken(
  payload: AuthTokenPayload,
): string {
  const expiresIn = (
    process.env.JWT_EXPIRES_IN ?? '7d'
  ) as SignOptions['expiresIn']

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn,
  })
}

export function verifyAccessToken(
  token: string,
): AuthTokenPayload {
  return jwt.verify(
    token,
    getJwtSecret(),
  ) as AuthTokenPayload
}
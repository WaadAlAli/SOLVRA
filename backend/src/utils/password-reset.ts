import crypto from 'node:crypto'

const RESET_TOKEN_BYTES = 32
const RESET_TOKEN_EXPIRY_MINUTES = 30

export function generatePasswordResetToken(): {
  rawToken: string
  tokenHash: string
  expiresAt: Date
} {
  const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex')

  const tokenHash = hashPasswordResetToken(rawToken)

  const expiresAt = new Date(
    Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
  )

  return {
    rawToken,
    tokenHash,
    expiresAt,
  }
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

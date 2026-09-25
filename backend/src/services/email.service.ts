import { Resend } from 'resend'

const resend = new Resend(
  process.env.RESEND_API_KEY,
)

function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
): Promise<void> {
  const frontendUrl =
    getRequiredEnv('FRONTEND_URL')

  const resetUrl =
    `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`

  const from = getRequiredEnv('EMAIL_FROM')

  const { error } = await resend.emails.send({
    from,
    to: [email],
    subject: 'Reset your SOLVRA password',
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 24px;
        color: #17202A;
      ">
        <h1 style="
          margin-bottom: 8px;
          font-size: 28px;
        ">
          SOLVRA
        </h1>

        <p style="
          color: #D47A3A;
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
        ">
          Solar Procurement Intelligence
        </p>

        <h2 style="margin-top: 40px;">
          Reset your password
        </h2>

        <p>
          We received a request to reset your SOLVRA password.
        </p>

        <p>
          Click the button below to create a new password.
        </p>

        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            margin: 20px 0;
            padding: 13px 22px;
            background: #D47A3A;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
          "
        >
          Reset Password
        </a>

        <p>
          This link expires in 30 minutes and can only
          be used once.
        </p>

        <p style="color: #6b7280;">
          If you didn't request this password reset,
          you can safely ignore this email.
        </p>

        <hr style="
          margin: 32px 0;
          border: none;
          border-top: 1px solid #e5e7eb;
        " />

        <p style="
          font-size: 12px;
          color: #9ca3af;
        ">
          SOLVRA — AI-Powered Solar Bidding & Decision Platform
        </p>
      </div>
    `,
  })

  if (error) {
    console.error(
      'Resend email error:',
      error,
    )

    throw new Error(
      'PASSWORD_RESET_EMAIL_FAILED',
    )
  }
}
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

import AuthShell from '../../components/auth/AuthShell'
import { forgotPassword } from '../../services/auth.service'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      await forgotPassword(email.trim())

      setSubmitted(true)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to process your request.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Reset your password."
      subtitle="Enter your account email and we'll help you get back into SOLVRA."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-2 font-medium text-[var(--text-primary)]"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      }
    >
      {submitted ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D47A3A]/10 text-[var(--copper)]">
            <CheckCircle2 size={21} />
          </div>

          <h2 className="mt-5 text-lg font-semibold">Check your email.</h2>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            If an account exists for{' '}
            <span className="font-medium text-[var(--text-primary)]">
              {email}
            </span>
            , you'll receive instructions to reset your password.
          </p>

          <p className="mt-4 text-xs leading-5 text-[var(--text-muted)]">
            The reset link is valid for 30 minutes and can only be used once.
          </p>

          <Link
            to="/login"
            className="mt-6 flex h-11 items-center justify-center rounded-xl bg-[var(--copper)] text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)]"
          >
            Return to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="reset-email"
              className="mb-2 block text-sm font-medium"
            >
              Account email
            </label>

            <div className="relative">
              <Mail
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />

              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError('')
                }}
                placeholder="you@company.com"
                required
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] pl-11 pr-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--copper)] focus:ring-2 focus:ring-[var(--copper)]/10"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[var(--copper)] text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              'Send reset instructions'
            )}
          </button>
        </form>
      )}
    </AuthShell>
  )
}

export default ForgotPasswordPage

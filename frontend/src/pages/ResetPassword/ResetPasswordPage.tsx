import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  XCircle,
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import AuthShell from '../../components/auth/AuthShell'
import { resetPassword } from '../../services/auth.service'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('This password reset link is missing or invalid.')
    }
  }, [token])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')

    if (!token) {
      setError('This password reset link is missing or invalid.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await resetPassword(token, password, confirmPassword)

      setSuccess(true)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'This password reset link is invalid or has expired.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthShell
        title="Password updated."
        subtitle="Your SOLVRA account is secure again. You can now sign in with your new password."
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
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--copper)]/10 text-[var(--copper)]">
            <CheckCircle2 size={23} />
          </div>

          <h2 className="mt-5 text-lg font-semibold">Access restored.</h2>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Your password has been changed successfully. The previous password
            can no longer be used.
          </p>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="group mt-6 flex h-12 w-full items-center justify-between rounded-xl bg-[var(--copper)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)]"
          >
            Continue to SOLVRA
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Create a new password."
      subtitle="Choose a strong password to secure your SOLVRA account."
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
      {!token ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
            <XCircle size={21} />
          </div>

          <h2 className="mt-5 text-lg font-semibold">Invalid reset link.</h2>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            This page needs a valid password reset link. Please request a new
            one.
          </p>

          <Link
            to="/forgot-password"
            className="mt-6 flex h-11 items-center justify-center rounded-xl bg-[var(--copper)] text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)]"
          >
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-medium"
            >
              New password
            </label>

            <div className="relative">
              <LockKeyhole
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />

              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-11 pr-12 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--copper)] focus:ring-2 focus:ring-[var(--copper)]/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-medium"
            >
              Confirm new password
            </label>

            <div className="relative">
              <LockKeyhole
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />

              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  setError('')
                }}
                placeholder="Repeat your password"
                required
                minLength={8}
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-11 pr-12 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--copper)] focus:ring-2 focus:ring-[var(--copper)]/10"
              />

              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
            <p className="text-xs font-medium">Password requirements</p>

            <p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">
              At least 8 characters, including uppercase, lowercase, and a
              number.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex h-12 w-full items-center justify-between rounded-xl bg-[var(--copper)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span>Updating password...</span>

                <Loader2 size={18} className="animate-spin" />
              </>
            ) : (
              <>
                <span>Update password</span>

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  )
}

export default ResetPasswordPage

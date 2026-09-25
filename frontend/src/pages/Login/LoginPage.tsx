import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import AuthShell from '../../components/auth/AuthShell'
import { login } from '../../services/auth.service'

interface LoginLocationState {
  registered?: boolean
  email?: string
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as LoginLocationState | null

  const [email, setEmail] = useState(state?.email ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registeredMessage, setRegisteredMessage] =
    useState(Boolean(state?.registered))

  useEffect(() => {
    if (state?.registered) {
      window.history.replaceState({}, document.title)
    }
  }, [state?.registered])

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await login({
        email,
        password,
      })

      if (response.success) {
        const destination =
          response.user?.role === 'SUPPLIER'
            ? '/supplier'
            : '/dashboard'

        navigate(destination, { replace: true })
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to sign you in.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to continue managing your solar procurement decisions."
      footer={
        <>
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-[var(--text-primary)] underline underline-offset-4"
          >
            Create one
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {registeredMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-[#D47A3A]/20 bg-[#D47A3A]/5 px-4 py-3.5">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-[var(--copper)]"
            />

            <div>
              <p className="text-sm font-medium">
                Account created successfully.
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                Sign in with your new account to continue.
              </p>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
          >
            Work email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setRegisteredMessage(false)
            }}
            placeholder="you@company.com"
            required
            autoFocus={!email}
            className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--copper)] focus:ring-2 focus:ring-[var(--copper)]/10"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 pr-12 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--copper)] focus:ring-2 focus:ring-[var(--copper)]/10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((value) => !value)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
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
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--copper)] text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <>
              Sign in
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  )
}

export default LoginPage
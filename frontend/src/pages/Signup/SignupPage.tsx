import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import AuthShell from '../../components/auth/AuthShell'
import { register } from '../../services/auth.service'

type Role = 'BUYER' | 'SUPPLIER'

function SignupPage() {
  const navigate = useNavigate()

  const [role, setRole] = useState<Role>('BUYER')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    buyerType: 'INDIVIDUAL' as
      | 'INDIVIDUAL'
      | 'BUSINESS'
      | 'INSTITUTION',
    location: '',
    phone: '',
    companyName: '',
  })

  const updateField = (
    field: keyof typeof form,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      await register({
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role,
        displayName:
          role === 'BUYER'
            ? form.displayName
            : form.companyName,
        ...(role === 'BUYER'
          ? {
              buyerType: form.buyerType,
              location: form.location,
              phone: form.phone || undefined,
            }
          : {
              companyName: form.companyName,
            }),
      })

      navigate('/login', {
  state: {
    registered: true,
    email: form.email,
  },
})
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to create your account.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account."
      subtitle="Choose your workspace and start building better solar procurement decisions."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-[var(--text-primary)] underline underline-offset-4"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            I am joining as
          </label>

          <div className="grid grid-cols-2 gap-2">
            {(['BUYER', 'SUPPLIER'] as Role[]).map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`h-11 rounded-xl border text-sm font-medium transition ${
                    role === option
                      ? 'border-[var(--copper)] bg-[var(--copper)] text-white'
                      : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  {option === 'BUYER'
                    ? 'Buyer'
                    : 'Supplier'}
                </button>
              ),
            )}
          </div>
        </div>

        {role === 'BUYER' ? (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Name
              </label>

              <input
                required
                value={form.displayName}
                onChange={(event) =>
                  updateField(
                    'displayName',
                    event.target.value,
                  )
                }
                placeholder="Your name or organization"
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 text-sm outline-none focus:border-[var(--copper)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Buyer type
              </label>

              <select
                value={form.buyerType}
                onChange={(event) =>
                  updateField(
                    'buyerType',
                    event.target.value,
                  )
                }
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 text-sm outline-none focus:border-[var(--copper)]"
              >
                <option value="INDIVIDUAL">
                  Individual
                </option>
                <option value="BUSINESS">
                  Business
                </option>
                <option value="INSTITUTION">
                  Institution
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                General location
              </label>

              <input
                required
                value={form.location}
                onChange={(event) =>
                  updateField(
                    'location',
                    event.target.value,
                  )
                }
                placeholder="e.g. Beirut, Lebanon"
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 text-sm outline-none focus:border-[var(--copper)]"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Company name
            </label>

            <input
              required
              value={form.companyName}
              onChange={(event) =>
                updateField(
                  'companyName',
                  event.target.value,
                )
              }
              placeholder="Your solar company"
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 text-sm outline-none focus:border-[var(--copper)]"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Work email
          </label>

          <input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              updateField('email', event.target.value)
            }
            placeholder="you@company.com"
            className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 text-sm outline-none focus:border-[var(--copper)]"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <div className="relative">
              <input
                required
                type={
                  showPassword ? 'text' : 'password'
                }
                value={form.password}
                onChange={(event) =>
                  updateField(
                    'password',
                    event.target.value,
                  )
                }
                placeholder="Min. 8 characters"
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 pr-11 text-sm outline-none focus:border-[var(--copper)]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm password
            </label>

            <div className="relative">
              <input
                required
                type={
                  showConfirm ? 'text' : 'password'
                }
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField(
                    'confirmPassword',
                    event.target.value,
                  )
                }
                placeholder="Repeat password"
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 pr-11 text-sm outline-none focus:border-[var(--copper)]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm((value) => !value)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              >
                {showConfirm ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
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
          className="flex h-12 w-full items-center justify-center rounded-xl bg-[var(--copper)] text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)] disabled:opacity-60"
        >
          {loading ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthShell>
  )
}

export default SignupPage
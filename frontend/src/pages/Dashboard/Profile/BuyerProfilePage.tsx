import {
  Check,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import { useAuth } from '../../../context/AuthContext'
import {
  getBuyerProfile,
  updateBuyerProfile,
  type BuyerProfile,
} from '../../../services/buyer.service'

function BuyerProfilePage() {
  const { refreshUser } = useAuth()
  const [profile, setProfile] = useState<BuyerProfile | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [buyerType, setBuyerType] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getBuyerProfile()

        if (!response.success) {
          throw new Error(
            response.message || 'Unable to load profile.',
          )
        }

        const data = response.profile

        setProfile(data)
        setDisplayName(data.displayName || '')
        setBuyerType(data.buyerType || '')
        setLocation(data.location || '')
        setPhone(data.phone || '')
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load profile.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [])

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    try {
      setSaving(true)
      setMessage('')
      setError('')

      const response = await updateBuyerProfile({
        displayName: displayName.trim(),
        buyerType: buyerType || undefined,
        location: location.trim(),
        phone: phone.trim(),
      })

      if (!response.success) {
        throw new Error(
          response.message || 'Unable to update profile.',
        )
      }

      setProfile(response.profile)
      await refreshUser()
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update profile.',
      )
    } finally {
      setSaving(false)
    }
  }

  const email = profile?.user?.email || ''

  return (
    <DashboardShell role="BUYER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
            Your profile
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Manage the information used across your SOLVRA workspace.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-32 rounded bg-[var(--text-primary)]/10" />
              <div className="h-11 rounded bg-[var(--text-primary)]/10" />
              <div className="h-11 rounded bg-[var(--text-primary)]/10" />
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Identity */}
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--copper)]/10 text-[var(--copper)]">
                  <UserRound size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    Personal information
                  </h2>

                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Basic information about your buyer account.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Display name"
                  value={displayName}
                  onChange={setDisplayName}
                  placeholder="Your name"
                />

                <Field
                  label="Buyer type"
                  value={buyerType}
                  onChange={setBuyerType}
                  placeholder="e.g. Business"
                />

                <Field
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  placeholder="City or region"
                  icon={<MapPin size={14} />}
                />

                <Field
                  label="Phone"
                  value={phone}
                  onChange={setPhone}
                  placeholder="Phone number"
                  icon={<Phone size={14} />}
                />
              </div>
            </section>

            {/* Email */}
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--text-primary)]/[0.04] text-[var(--text-muted)]">
                  <Mail size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Email address
                  </p>

                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Your login email address.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                {email || 'Not available'}
              </div>

              <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                Email changes are not currently available from this page.
              </p>
            </section>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-500">
                <Check size={15} />
                {message}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[var(--text-primary)] px-5 py-3 text-xs font-semibold text-[var(--bg-primary)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardShell>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  icon?: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </span>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {icon}
          </span>
        )}

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--copper)]/50 ${
            icon ? 'pl-9' : ''
          }`}
        />
      </div>
    </label>
  )
}

export default BuyerProfilePage
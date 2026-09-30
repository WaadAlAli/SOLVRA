import { Check, Mail, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import { useAuth } from '../../../context/AuthContext'
import {
  getSupplierProfile,
  updateSupplierProfile,
  type SupplierProfile,
} from '../../../services/supplier.service'

function SupplierProfilePage() {
  const { refreshUser } = useAuth()
  const [profile, setProfile] = useState<SupplierProfile | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [serviceAreas, setServiceAreas] = useState('')
  const [capabilities, setCapabilities] = useState('')
  const [certifications, setCertifications] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getSupplierProfile()

        if (!response.success || !response.profile) {
          throw new Error(
            response.message || 'Unable to load supplier profile.',
          )
        }

        const data = response.profile
        setProfile(data)
        setCompanyName(data.companyName || '')
        setServiceAreas((data.serviceAreas ?? []).join(', '))
        setCapabilities((data.capabilities ?? []).join(', '))
        setCertifications(data.certifications || '')
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load supplier profile.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadProfile()
  }, [])

  const parseList = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const response = await updateSupplierProfile({
        companyName: companyName.trim(),
        serviceAreas: parseList(serviceAreas),
        capabilities: parseList(capabilities),
        certifications: certifications.trim() || null,
      })

      if (!response.success || !response.profile) {
        throw new Error(
          response.message || 'Unable to update supplier profile.',
        )
      }

      setProfile(response.profile)
      setCompanyName(response.profile.companyName || '')
      setServiceAreas((response.profile.serviceAreas ?? []).join(', '))
      setCapabilities((response.profile.capabilities ?? []).join(', '))
      setCertifications(response.profile.certifications || '')
      await refreshUser()
      setMessage('Supplier profile updated successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update supplier profile.',
      )
    } finally {
      setSaving(false)
    }
  }

  const email = profile?.user?.email || ''

  return (
    <DashboardShell role="SUPPLIER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
            Supplier profile
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Manage the company identity and service information used across the
            supplier workspace.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-40 rounded bg-[var(--text-primary)]/10" />
              <div className="h-11 rounded bg-[var(--text-primary)]/10" />
              <div className="h-11 rounded bg-[var(--text-primary)]/10" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--copper)]/10 text-[var(--copper)]">
                  <UserRound size={17} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Business identity</h2>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Your company profile appears in supplier-facing workflows.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Company / business name"
                  value={companyName}
                  onChange={setCompanyName}
                  placeholder="SolarWorks Ltd."
                />

                <Field
                  label="Service areas"
                  value={serviceAreas}
                  onChange={setServiceAreas}
                  placeholder="Beirut, Jbeil, Tripoli"
                />

                <Field
                  label="Capabilities"
                  value={capabilities}
                  onChange={setCapabilities}
                  placeholder="Roof mounting, battery storage, O&M"
                />

                <Field
                  label="Certifications"
                  value={certifications}
                  onChange={setCertifications}
                  placeholder="ISO 9001, PV installation"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--text-primary)]/[0.04] text-[var(--text-muted)]">
                  <Mail size={17} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Email address</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Your login email address.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                {email || 'Not available'}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--text-primary)]/[0.04] text-[var(--text-muted)]">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Verification</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Admin verification status for this supplier account.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                <MapPin size={14} className="text-[var(--copper)]" />
                {profile?.verifiedByAdmin
                  ? 'Verified supplier account'
                  : 'Pending verification'}
              </div>
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
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--copper)] focus:ring-2 focus:ring-[var(--copper)]/10"
      />
    </label>
  )
}

export default SupplierProfilePage

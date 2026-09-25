import {
  Bell,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import { logout } from '../../../services/auth.service'
import { useAuth } from '../../../context/AuthContext'

function SupplierSettingsPage() {
  const navigate = useNavigate()
  const { clearUser } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await logout()
      clearUser()
      navigate('/login', { replace: true })
    } catch {
      clearUser()
      navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <DashboardShell role="SUPPLIER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
            Settings
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Manage your supplier workspace preferences, security, and account context.
          </p>
        </div>

        <div className="space-y-4">
          <SettingsCard
            icon={<UserRound size={17} />}
            title="Supplier profile"
            description="Manage your company identity, service areas, and business capabilities."
            status="Available"
          />

          <SettingsCard
            icon={<LockKeyhole size={17} />}
            title="Password & security"
            description="Password recovery and account security are handled through your authenticated account."
            status="Protected"
          />

          <SettingsCard
            icon={<Bell size={17} />}
            title="Notifications"
            description="Notification preferences will be available as supplier alerting features are introduced."
            status="Coming soon"
          />

          <SettingsCard
            icon={<ShieldCheck size={17} />}
            title="Privacy & data"
            description="Your supplier account and bid activity are isolated to the authenticated supplier workspace."
            status="Protected"
          />

          <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                <LogOut size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold">Sign out</h2>
                <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--text-muted)]">
                  End your current supplier session and return to the login screen.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="shrink-0 rounded-xl border border-red-500/30 bg-red-500/[0.04] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-500 transition hover:bg-red-500/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </section>
        </div>
      </div>
    </DashboardShell>
  )
}

function SettingsCard({
  icon,
  title,
  description,
  status,
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: string
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--text-primary)]/[0.04] text-[var(--text-muted)]">
          {icon}
        </div>

        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--text-muted)]">{description}</p>
        </div>
      </div>

      <span className="shrink-0 rounded-full border border-[var(--border)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
        {status}
      </span>
    </section>
  )
}

export default SupplierSettingsPage

import {
  Bell,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import DashboardShell from '../../../components/dashboard/DashboardShell'

function SettingsPage() {
  return (
    <DashboardShell role="BUYER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
            Settings
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Manage your SOLVRA workspace preferences and account security.
          </p>
        </div>

        <div className="space-y-4">
          <SettingsCard
            icon={<UserRound size={17} />}
            title="Profile"
            description="Manage your personal and buyer information."
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
            description="Notification preferences will be available as notification features are introduced."
            status="Coming soon"
          />

          <SettingsCard
            icon={<ShieldCheck size={17} />}
            title="Privacy & data"
            description="Your buyer workspace and procurement information are isolated to your account."
            status="Protected"
          />
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
          <h2 className="text-sm font-semibold">
            {title}
          </h2>

          <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--text-muted)]">
            {description}
          </p>
        </div>
      </div>

      <span className="shrink-0 rounded-full border border-[var(--border)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
        {status}
      </span>
    </section>
  )
}

export default SettingsPage
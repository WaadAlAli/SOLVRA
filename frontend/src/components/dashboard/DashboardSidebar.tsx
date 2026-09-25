import {
  Calculator,
  ChevronDown,
  ClipboardList,
  FileText,
  GitCompareArrows,
  Handshake,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import DashboardNavItem from './DashboardNavItem'
import { logout } from '../../services/auth.service'
import { useAuth } from '../../context/AuthContext'
import { getUserDisplayName } from '../../utils/userDisplayName'

interface DashboardSidebarProps {
  role: 'BUYER' | 'SUPPLIER' | 'ADMIN'
}

function DashboardSidebar({
  role,
}: DashboardSidebarProps) {
  const roleLabel =
    role === 'BUYER'
      ? 'Buyer'
      : role === 'SUPPLIER'
        ? 'Supplier'
        : 'Administrator'

  const navigate = useNavigate()
  const { user, clearUser } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const displayName = getUserDisplayName(user)
  const workspaceInitial = displayName.charAt(0).toUpperCase() || 'S'

const handleLogout = async () => {
  try {
    setLoggingOut(true)

    await logout()
    clearUser()

    navigate('/login', { replace: true })
  } catch {
    // Even if the server request fails,
    // clear the local authenticated state.
    clearUser()
    navigate('/login', { replace: true })
  } finally {
    setLoggingOut(false)
  }
}

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] border-r border-[var(--border)] bg-[var(--bg-primary)] lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex h-[76px] items-center border-b border-[var(--border)] px-5">
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--text-primary)]/15">
            <div className="absolute inset-1 rounded-full border border-[var(--copper)]/40" />

            <span className="relative text-[9px] font-bold tracking-[0.15em]">
              SV
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.22em]">
              SOLVRA
            </p>

            <p className="mt-0.5 text-[8px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Decision platform
            </p>
          </div>
        </Link>
      </div>

      {/* Workspace */}
      <div className="border-b border-[var(--border)] px-4 py-4">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left transition hover:bg-[var(--text-primary)]/[0.035]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--copper)]/10 text-[10px] font-bold text-[var(--copper)]">
              {workspaceInitial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">
                {displayName}
              </p>

              <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {roleLabel}
              </p>
            </div>
          </div>

          <ChevronDown
            size={14}
            className="shrink-0 text-[var(--text-muted)]"
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {role === 'SUPPLIER' ? (
          <>
            <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Overview
            </p>

            <DashboardNavItem
              to="/supplier"
              label="Dashboard"
              icon={LayoutDashboard}
              end
            />

            <div className="my-6">
              <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Supplier
              </p>

              <div className="space-y-0.5">
                <DashboardNavItem
                  to="/supplier/requests"
                  label="Solar Requests"
                  icon={ClipboardList}
                />

                <DashboardNavItem
                  to="/supplier/bids"
                  label="My Bids"
                  icon={FileText}
                />
              </div>
            </div>

            <div className="my-6">
              <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Account
              </p>

              <div className="space-y-0.5">
                <DashboardNavItem
                  to="/supplier/profile"
                  label="Profile"
                  icon={UserRound}
                />

                <DashboardNavItem
                  to="/supplier/settings"
                  label="Settings"
                  icon={Settings}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Overview
            </p>

            <DashboardNavItem
              to="/dashboard"
              label="Dashboard"
              icon={LayoutDashboard}
              end
            />

            <div className="my-6">
              <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Procurement
              </p>

              <div className="space-y-0.5">
                <DashboardNavItem
                  to="/dashboard/requests"
                  label="My Requests"
                  icon={ClipboardList}
                />

                <DashboardNavItem
                  to="/dashboard/bids"
                  label="Bids"
                  icon={FileText}
                />

                <DashboardNavItem
                  to="/dashboard/compare"
                  label="Compare"
                  icon={GitCompareArrows}
                />

                <DashboardNavItem
                  to="/dashboard/negotiations"
                  label="Negotiations"
                  icon={Handshake}
                />
              </div>
            </div>

            <div className="my-6">
              <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Intelligence
              </p>

              <div className="space-y-0.5">
                <DashboardNavItem
                  to="/dashboard/insights"
                  label="AI Insights"
                  icon={Sparkles}
                />

                <DashboardNavItem
                  to="/dashboard/what-if"
                  label="What-If"
                  icon={Calculator}
                />
              </div>
            </div>

            <div className="my-6">
              <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Account
              </p>

              <div className="space-y-0.5">
                <DashboardNavItem
                  to="/dashboard/profile"
                  label="Profile"
                  icon={UserRound}
                />

                <DashboardNavItem
                  to="/dashboard/settings"
                  label="Settings"
                  icon={Settings}
                />
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Security / footer */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="mb-3 flex items-center gap-2 px-2 text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
          <ShieldCheck
            size={12}
            className="text-[var(--copper)]"
          />
          Secure workspace
        </div>

        <button
       type="button"
       onClick={handleLogout}
       disabled={loggingOut}
       className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-red-500/[0.04] hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50">
      <LogOut size={16} />

      {loggingOut ? 'Signing out...' : 'Sign out'}
     </button>
      </div>
    </aside>
  )
}

export default DashboardSidebar
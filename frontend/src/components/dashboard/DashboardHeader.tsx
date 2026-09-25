import {
  Bell,
  Menu,
  Search,
} from 'lucide-react'

import ThemeToggle from '../ui/ThemeToggle'

interface DashboardHeaderProps {
  role: 'BUYER' | 'SUPPLIER' | 'ADMIN'
}

function DashboardHeader({
  role,
}: DashboardHeaderProps) {
  const roleLabel =
    role === 'BUYER'
      ? 'Buyer workspace'
      : role === 'SUPPLIER'
        ? 'Supplier workspace'
        : 'Admin workspace'

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur">
      <div className="flex h-[76px] items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Mobile menu */}
        <button
          type="button"
          className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/[0.05] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        {/* Page context */}
        <div className="hidden lg:block">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            SOLVRA
          </p>

          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {roleLabel}
          </p>
        </div>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden h-9 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-xs text-[var(--text-muted)] transition hover:text-[var(--text-primary)] sm:flex"
          >
            <Search size={14} />
            <span>Search</span>
            <kbd className="ml-3 text-[9px]">
              ⌘ K
            </kbd>
          </button>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            aria-label="Notifications"
          >
            <Bell size={16} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--copper)]" />
          </button>

          <ThemeToggle />

          <div className="ml-1 hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--text-primary)]/[0.04] text-xs font-semibold sm:flex">
            W
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface DashboardNavItemProps {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

function DashboardNavItem({
  to,
  label,
  icon: Icon,
  end = false,
}: DashboardNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
          isActive
            ? 'bg-[var(--text-primary)]/[0.06] font-medium text-[var(--text-primary)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/[0.035] hover:text-[var(--text-primary)]',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={17}
            strokeWidth={isActive ? 2 : 1.7}
            className={
              isActive
                ? 'text-[var(--copper)]'
                : 'text-[var(--text-muted)] transition group-hover:text-[var(--text-secondary)]'
            }
          />

          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default DashboardNavItem

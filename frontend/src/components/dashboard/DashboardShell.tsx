import type { ReactNode } from 'react'

import DashboardSidebar from './DashboardSidebar'
import DashboardHeader from './DashboardHeader'

interface DashboardShellProps {
  children: ReactNode
  role: 'BUYER' | 'SUPPLIER' | 'ADMIN'
}

function DashboardShell({ children, role }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <DashboardSidebar role={role} />

      <div className="lg:pl-[250px]">
        <DashboardHeader role={role} />

        <main className="px-5 pb-10 pt-6 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default DashboardShell

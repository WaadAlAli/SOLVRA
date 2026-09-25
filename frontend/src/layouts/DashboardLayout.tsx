import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {children}
    </div>
  )
}

export default DashboardLayout
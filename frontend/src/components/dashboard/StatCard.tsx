import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  description?: string
  icon: LucideIcon
  accent?: 'default' | 'ai'
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  accent = 'default',
}: StatCardProps) {
  const isAI = accent === 'ai'

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 transition hover:border-[var(--border-strong)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            {value}
          </p>
        </div>

        <div
          className={[
            'flex h-9 w-9 items-center justify-center rounded-xl',
            isAI
              ? 'bg-[#00E5FF]/10 text-[#00E5FF]'
              : 'bg-[var(--text-primary)]/[0.04] text-[var(--copper)]',
          ].join(' ')}
        >
          <Icon size={17} />
        </div>
      </div>

      {description && (
        <p className="mt-3 text-xs text-[var(--text-secondary)]">
          {description}
        </p>
      )}
    </div>
  )
}

export default StatCard
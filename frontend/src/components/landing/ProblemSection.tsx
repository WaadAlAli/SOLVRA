import type { ReactNode } from 'react'
import {
  ArrowDown,
  ArrowRight,
  Check,
  FileSpreadsheet,
  FileText,
  Scale,
} from 'lucide-react'

function ProblemSection() {
  return (
    <section
      id="buyers"
      className="relative overflow-hidden bg-[var(--bg-secondary)] py-24 text-[var(--text-primary)] transition-colors duration-300 sm:py-32"
    >
      {/* Subtle background structure */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-200px] top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#D47A3A]/5 blur-[130px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(23,32,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(23,32,42,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section introduction */}
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#D47A3A]">
              BEFORE SOLVRA
            </p>

            <div className="mt-5 h-px w-16 bg-[#D47A3A]" />
          </div>

          <div>
            <h2 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-[var(--text-primary)] sm:text-5xl lg:text-[58px]">
              You know what your organization needs.
              <span className="mt-2 block text-[var(--text-secondary)]">
                The difficult part is deciding which proposal fits.
              </span>
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
              A solar procurement decision can involve technical specifications,
              storage requirements, warranties, pricing, assumptions, and
              long-term costs — often spread across different supplier
              proposals.
            </p>
          </div>
        </div>

        {/* Buyer perspective */}
        <div className="mt-20">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D47A3A]/10">
              <Scale size={14} className="text-[#D47A3A]" />
            </span>

            <span className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)]">
              THE BUYER'S VIEW
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            {/* Incoming proposals */}
            <div className="space-y-3">
              <Proposal
                icon={<FileText size={17} />}
                title="Technical proposal"
                details="PV capacity · inverter · battery · warranty"
              />

              <Proposal
                icon={<FileSpreadsheet size={17} />}
                title="Commercial proposal"
                details="Pricing · payment terms · project scope"
              />

              <Proposal
                icon={<FileText size={17} />}
                title="Supplier assumptions"
                details="System boundaries · expected performance · conditions"
              />
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-4 lg:px-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)]">
                <ArrowRight
                  size={18}
                  className="hidden text-[var(--text-muted)] lg:block"
                />

                <ArrowDown
                  size={18}
                  className="text-[var(--text-muted)] lg:hidden"
                />
              </div>
            </div>

            {/* Decision problem */}
            <div className="rounded-2xl border border-[#D47A3A]/20 bg-[#D47A3A]/[0.045] p-6 sm:p-7">
              <p className="text-[10px] font-bold tracking-[0.15em] text-[#D47A3A]">
                THE DECISION
              </p>

              <h3 className="mt-3 text-xl font-bold leading-tight text-[var(--text-primary)]">
                Which proposal actually matches the requirement?
              </h3>

              <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                Not simply the lowest price. Not simply the largest system. The
                decision depends on the criteria that matter to your
                organization.
              </p>

              <div className="mt-6 space-y-2.5">
                <DecisionItem text="Technical fit" />
                <DecisionItem text="Commercial value" />
                <DecisionItem text="Long-term cost" />
                <DecisionItem text="Your evaluation priorities" />
              </div>
            </div>
          </div>
        </div>

        {/* Core statement */}
        <div className="mt-20 border-t border-[var(--border)] pt-10 sm:mt-24">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="max-w-3xl text-2xl font-semibold leading-[1.25] tracking-[-0.02em] text-[var(--text-primary)] sm:text-3xl">
                SOLVRA gives buyers a structured way to move from
                <span className="text-[#D47A3A]"> proposals </span>
                to a
                <span className="text-[#D47A3A]"> defensible decision.</span>
              </p>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.14em] text-[var(--text-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D47A3A]" />
              BUYER-CONTROLLED
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Proposal({
  icon,
  title,
  details,
}: {
  icon: ReactNode
  title: string
  details: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 transition-colors duration-300">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-muted)]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-[var(--text-muted)]">
          {details}
        </p>
      </div>
    </div>
  )
}

function DecisionItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Check size={13} className="text-[#D47A3A]" />

      <span className="text-xs font-medium text-[var(--text-secondary)]">
        {text}
      </span>
    </div>
  )
}

export default ProblemSection

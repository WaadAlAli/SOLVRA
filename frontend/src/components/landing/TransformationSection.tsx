import {
  ArrowRight,
  Check,
  FileText,
  GitCompare,
  Scale,
  Search,
  ShieldCheck,
} from 'lucide-react'

const transformations = [
  {
    icon: FileText,
    before: 'Requirements scattered across conversations, notes, and documents.',
    after: 'One structured procurement requirement that suppliers can respond to.',
  },
  {
    icon: Search,
    before: 'Every supplier describes their proposal differently.',
    after: 'Technical and commercial information is normalized for evaluation.',
  },
  {
    icon: GitCompare,
    before: 'Comparing PDFs, spreadsheets, warranties, and assumptions manually.',
    after: 'Relevant differences appear together in one comparison view.',
  },
  {
    icon: Scale,
    before: 'Decisions can become dominated by whichever number is easiest to see.',
    after: 'Your criteria and weighting determine how proposals are evaluated.',
  },
  {
    icon: ShieldCheck,
    before: 'Important decisions can disappear into emails and conversations.',
    after:
      'Versions, negotiations, and award decisions remain part of the audit trail.',
  },
]

function TransformationSection() {
  return (
    <section
      id="transformation"
      className="relative overflow-hidden bg-[var(--bg-primary)] py-24 text-[var(--text-primary)] transition-colors duration-300 sm:py-32"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#D47A3A]/[0.035] blur-[160px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(23,32,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(23,32,42,0.025)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <div>
            <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--text-muted)]">
           03
        </span>

        <span className="h-px w-8 bg-[var(--border)]" />

         <p className="text-xs font-bold tracking-[0.18em] text-[#D47A3A]">
         PROCUREMENT, REFRAMED
           </p>
         </div>

            <div className="mt-5 h-px w-16 bg-[#D47A3A]" />
          </div>

          <div>
            <h2 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-[var(--text-primary)] sm:text-5xl lg:text-[58px]">
              Stop comparing proposals.
              <span className="mt-2 block text-[var(--text-secondary)]">
                Start comparing decisions.
              </span>
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
              SOLVRA turns fragmented procurement work into a structured
              decision process — so the important differences become visible
              before the decision is made.
            </p>
          </div>
        </div>

        {/* Transformation table */}
        <div className="mt-16 overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)]">
          {/* Column labels */}
          <div className="hidden grid-cols-[1fr_72px_1fr] border-b border-[var(--border)] bg-[var(--bg-tertiary)] md:grid">
            <div className="px-7 py-4">
              <span className="text-[10px] font-bold tracking-[0.16em] text-[var(--text-muted)]">
                WITHOUT STRUCTURE
              </span>
            </div>

            <div />

            <div className="border-l border-[var(--border)] px-7 py-4">
              <span className="text-[10px] font-bold tracking-[0.16em] text-[#D47A3A]">
                WITH SOLVRA
              </span>
            </div>
          </div>

          {transformations.map((item, index) => {
            const Icon = item.icon

            return (
              <div
                key={item.before}
                className={`grid md:grid-cols-[1fr_72px_1fr] ${
                  index !== transformations.length - 1
                    ? 'border-b border-[var(--border)]'
                    : ''
                }`}
              >
                {/* Before */}
                <div className="p-6 sm:p-7">
                  <div className="flex gap-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]">
                      <Icon size={15} className="text-[var(--text-muted)]" />
                    </div>

                    <div>
                      <p className="mb-2 text-[9px] font-bold tracking-[0.14em] text-[var(--text-muted)] md:hidden">
                        WITHOUT STRUCTURE
                      </p>

                      <p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                        {item.before}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transition */}
                <div className="hidden items-center justify-center md:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D47A3A]/20 bg-[#D47A3A]/[0.06]">
                    <ArrowRight size={14} className="text-[#D47A3A]" />
                  </div>
                </div>

                {/* After */}
                <div className="border-t border-[var(--border)] bg-[var(--bg-tertiary)]/50 p-6 sm:p-7 md:border-l md:border-t-0">
                  <div className="flex gap-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D47A3A]/10">
                      <Check size={15} className="text-[#D47A3A]" />
                    </div>

                    <div>
                      <p className="mb-2 text-[9px] font-bold tracking-[0.14em] text-[#D47A3A] md:hidden">
                        WITH SOLVRA
                      </p>

                      <p className="max-w-md text-sm font-medium leading-6 text-[var(--text-primary)]">
                        {item.after}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom statement */}
        <div className="mt-12 flex flex-col gap-5 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            The goal is not to automate the buyer out of the process. It is to
            give the buyer a clearer process to make decisions.
          </p>

          <div className="flex items-center gap-3 text-xs font-semibold text-[var(--text-secondary)]">
            <span className="h-2 w-2 rounded-full bg-[#00E5FF]" />
            Intelligence where it helps.
            <span className="text-[var(--text-muted)]">•</span>
            Control where it matters.
          </div>
        </div>
      </div>
    </section>
  )
}

export default TransformationSection
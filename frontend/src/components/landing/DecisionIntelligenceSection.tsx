import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Sparkles,
} from 'lucide-react'

const bids = [
  {
    supplier: 'HelioGrid Energy',
    price: '$42,800',
    pv: '12.4 kWp',
    battery: '20 kWh',
    warranty: '10 years',
    score: '91.4',
  },
  {
    supplier: 'SunCore Systems',
    price: '$39,500',
    pv: '11.8 kWp',
    battery: '18 kWh',
    warranty: '8 years',
    score: '87.8',
  },
  {
    supplier: 'NovaVolt Energy',
    price: '$44,100',
    pv: '12.6 kWp',
    battery: '20 kWh',
    warranty: '12 years',
    score: '90.1',
  },
]

const criteria = [
  { label: 'Price', value: 40 },
  { label: 'System quality', value: 30 },
  { label: 'Warranty', value: 20 },
  { label: 'Delivery', value: 10 },
]

const comparisonRows = [
  {
    label: 'Upfront price',
    key: 'price',
  },
  {
    label: 'PV capacity',
    key: 'pv',
  },
  {
    label: 'Battery storage',
    key: 'battery',
  },
  {
    label: 'Warranty',
    key: 'warranty',
  },
] as const

function DecisionIntelligenceSection() {
  return (
    <section
      id="decision-intelligence"
      className="relative overflow-hidden bg-[var(--bg-primary)] py-24 text-[var(--text-primary)] transition-colors duration-300 sm:py-32"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-180px] top-1/4 h-[500px] w-[500px] rounded-full bg-[#00E5FF]/[0.025] blur-[150px]" />

        <div className="absolute bottom-0 left-[-180px] h-[500px] w-[500px] rounded-full bg-[#D47A3A]/[0.035] blur-[150px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(23,32,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(23,32,42,0.02)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-24">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--text-muted)]">
                04
              </span>

              <span className="h-px w-8 bg-[var(--border)]" />

              <p className="text-xs font-bold tracking-[0.18em] text-[#D47A3A]">
                DECISION INTELLIGENCE
              </p>
            </div>

            <div className="mt-5 h-px w-16 bg-[#D47A3A]" />

            <div className="mt-8 flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[#00E5FF]" />
              Live procurement workspace
            </div>
          </div>

          <div>
            <h2 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[58px]">
              See what matters.
              <span className="mt-2 block text-[var(--text-secondary)]">
                Before you make the call.
              </span>
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
              SOLVRA transforms different supplier proposals into a structured
              evaluation environment where technical, commercial, and decision
              criteria can be reviewed together.
            </p>
          </div>
        </div>

        {/* Product preview */}
        <div className="relative mt-16 overflow-hidden rounded-[20px] border border-[var(--border-strong)] bg-[var(--bg-secondary)] shadow-[0_30px_100px_rgba(10,14,23,0.12)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:rounded-[24px]">
          {/* Browser / application bar */}
          <div className="flex min-h-[58px] items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden shrink-0 gap-1.5 sm:flex">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--text-muted)]/30" />
              </div>

              <div className="hidden h-5 w-px bg-[var(--border)] sm:block" />

              <span className="truncate text-[9px] font-bold tracking-[0.1em] text-[var(--text-muted)] sm:text-[10px] sm:tracking-[0.12em]">
                SOLVRA / EVALUATION
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-[9px] font-semibold text-[var(--text-muted)] sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
              <span className="hidden xs:inline">Procurement #SOL-2048</span>
              <span className="xs:hidden">#SOL-2048</span>
            </div>
          </div>

          {/* Workspace */}
          <div className="grid lg:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <aside className="hidden border-r border-[var(--border)] bg-[var(--bg-tertiary)]/40 p-5 lg:block">
              <div className="mb-7">
                <p className="text-[9px] font-bold tracking-[0.14em] text-[var(--text-muted)]">
                  REQUEST
                </p>

                <p className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                  Commercial Solar
                </p>

                <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                  12.5 kWp · 20 kWh storage
                </p>
              </div>

              <nav className="space-y-1.5">
                {[
                  'Overview',
                  'Requirements',
                  'Received bids',
                  'Evaluation',
                  'Comparison',
                  'Negotiation',
                ].map((item) => {
                  const active = item === 'Evaluation'

                  return (
                    <div
                      key={item}
                      className={`rounded-lg px-3 py-2 text-[11px] font-medium ${
                        active
                          ? 'bg-[#D47A3A]/10 text-[#D47A3A]'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {item}
                    </div>
                  )
                })}
              </nav>
            </aside>

            {/* Main workspace */}
            <div className="min-w-0 p-4 sm:p-7 lg:p-8">
              {/* Workspace header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold tracking-[0.16em] text-[var(--text-muted)]">
                    EVALUATION
                  </p>

                  <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--text-primary)]">
                    Supplier proposals
                  </h3>

                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    3 proposals · Evaluation criteria configured
                  </p>
                </div>

                <button
                  type="button"
                  className="flex w-fit shrink-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[10px] font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)]"
                >
                  Balanced criteria
                  <ChevronDown size={13} />
                </button>
              </div>

              {/* Criteria */}
              <div className="mt-7 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]/50 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold tracking-[0.14em] text-[var(--text-muted)]">
                    EVALUATION CRITERIA
                  </p>

                  <CircleHelp size={13} className="text-[var(--text-muted)]" />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {criteria.map((criterion) => (
                    <div key={criterion.label}>
                      <div className="flex justify-between gap-2 text-[10px]">
                        <span className="text-[var(--text-secondary)]">
                          {criterion.label}
                        </span>

                        <span className="font-bold text-[var(--text-primary)]">
                          {criterion.value}%
                        </span>
                      </div>

                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--border)]">
                        <div
                          className="h-full rounded-full bg-[#D47A3A]"
                          style={{ width: `${criterion.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop comparison */}
              <div className="mt-6 hidden overflow-x-auto md:block">
                <div className="min-w-[700px]">
                  <div className="grid grid-cols-[1.5fr_repeat(3,1fr)] border-b border-[var(--border)] pb-3">
                    <span className="text-[9px] font-bold tracking-[0.12em] text-[var(--text-muted)]">
                      PROPOSAL
                    </span>

                    {bids.map((bid, index) => (
                      <div key={bid.supplier} className="px-2">
                        <p className="truncate text-[10px] font-bold text-[var(--text-primary)]">
                          {bid.supplier}
                        </p>

                        <p className="mt-1 text-[9px] text-[var(--text-muted)]">
                          Proposal {String.fromCharCode(65 + index)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {comparisonRows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[1.5fr_repeat(3,1fr)] border-b border-[var(--border)] py-4"
                    >
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {row.label}
                      </span>

                      {bids.map((bid) => (
                        <span
                          key={`${row.key}-${bid.supplier}`}
                          className="px-2 text-[10px] font-medium text-[var(--text-primary)]"
                        >
                          {bid[row.key]}
                        </span>
                      ))}
                    </div>
                  ))}

                  {/* Score */}
                  <div className="grid grid-cols-[1.5fr_repeat(3,1fr)] pt-5">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-primary)]">
                        Weighted score
                      </p>

                      <p className="mt-1 text-[9px] text-[var(--text-muted)]">
                        Deterministic calculation
                      </p>
                    </div>

                    {bids.map((bid, index) => (
                      <div
                        key={bid.supplier}
                        className={`mx-1 rounded-lg p-3 ${
                          index === 0
                            ? 'border border-[#D47A3A]/20 bg-[#D47A3A]/[0.06]'
                            : 'bg-[var(--bg-tertiary)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-[var(--text-primary)]">
                            {bid.score}
                          </span>

                          {index === 0 && (
                            <ArrowUpRight
                              size={14}
                              className="text-[#D47A3A]"
                            />
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-1">
                          <Check
                            size={10}
                            className={
                              index === 0
                                ? 'text-[#D47A3A]'
                                : 'text-[var(--text-muted)]'
                            }
                          />

                          <span className="text-[8px] text-[var(--text-muted)]">
                            System calculated
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile comparison */}
              <div className="mt-6 space-y-3 md:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.12em] text-[var(--text-muted)]">
                      SUPPLIER COMPARISON
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--text-secondary)]">
                      3 proposals · Key values
                    </p>
                  </div>
                </div>

                {bids.map((bid, index) => (
                  <article
                    key={bid.supplier}
                    className={`overflow-hidden rounded-xl border ${
                      index === 0
                        ? 'border-[#D47A3A]/25'
                        : 'border-[var(--border)]'
                    } bg-[var(--bg-secondary)]`}
                  >
                    {/* Supplier header */}
                    <div
                      className={`flex items-start justify-between gap-4 border-b p-4 ${
                        index === 0
                          ? 'border-[#D47A3A]/15 bg-[#D47A3A]/[0.045]'
                          : 'border-[var(--border)]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                          {bid.supplier}
                        </p>

                        <p className="mt-1 text-[9px] font-medium tracking-[0.1em] text-[var(--text-muted)]">
                          PROPOSAL {String.fromCharCode(65 + index)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[8px] font-bold tracking-[0.1em] text-[var(--text-muted)]">
                          SCORE
                        </p>

                        <div className="mt-0.5 flex items-center justify-end gap-1">
                          <span className="text-xl font-bold text-[var(--text-primary)]">
                            {bid.score}
                          </span>

                          {index === 0 && (
                            <ArrowUpRight
                              size={13}
                              className="text-[#D47A3A]"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bid details */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 p-4">
                      <div>
                        <p className="text-[8px] font-bold tracking-[0.1em] text-[var(--text-muted)]">
                          UPFRONT PRICE
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[var(--text-primary)]">
                          {bid.price}
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] font-bold tracking-[0.1em] text-[var(--text-muted)]">
                          PV CAPACITY
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[var(--text-primary)]">
                          {bid.pv}
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] font-bold tracking-[0.1em] text-[var(--text-muted)]">
                          BATTERY
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[var(--text-primary)]">
                          {bid.battery}
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] font-bold tracking-[0.1em] text-[var(--text-muted)]">
                          WARRANTY
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[var(--text-primary)]">
                          {bid.warranty}
                        </p>
                      </div>
                    </div>

                    {/* Deterministic indicator */}
                    <div className="flex items-center gap-1.5 border-t border-[var(--border)] px-4 py-3">
                      <Check
                        size={11}
                        className={
                          index === 0
                            ? 'text-[#D47A3A]'
                            : 'text-[var(--text-muted)]'
                        }
                      />

                      <span className="text-[9px] text-[var(--text-muted)]">
                        System calculated score
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* AI insight */}
              <div className="mt-7 rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/[0.035] p-4 sm:p-5">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00E5FF]/10">
                    <Sparkles
                      size={14}
                      className="text-[#00B8CC] dark:text-[#00E5FF]"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[9px] font-bold tracking-[0.13em] text-[#00B8CC] dark:text-[#00E5FF]">
                        AI INSIGHT
                      </p>

                      <span className="rounded-full border border-[#00E5FF]/20 px-2 py-0.5 text-[8px] font-medium text-[#00B8CC] dark:text-[#00E5FF]">
                        SUGGESTED — CONFIRM TO SAVE
                      </span>
                    </div>

                    <p className="mt-2 max-w-3xl text-xs leading-5 text-[var(--text-secondary)]">
                      HelioGrid has a higher upfront price than SunCore, but
                      provides stronger battery capacity and warranty coverage
                      under the configured evaluation criteria.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting principles */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Normalized',
              text: 'Different proposals become comparable.',
            },
            {
              title: 'Deterministic',
              text: 'Scores follow your configured criteria.',
            },
            {
              title: 'Explainable',
              text: 'Every decision has visible context.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5"
            >
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {item.title}
              </p>

              <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DecisionIntelligenceSection

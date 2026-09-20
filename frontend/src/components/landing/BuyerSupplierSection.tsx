import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  FileCheck2,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
} from 'lucide-react'

const buyerCapabilities = [
  {
    icon: Search,
    title: 'Define the requirement',
    text: 'Describe your energy needs and turn them into a structured procurement request.',
  },
  {
    icon: BarChart3,
    title: 'Evaluate proposals',
    text: 'Configure the criteria that matter and compare proposals consistently.',
  },
  {
    icon: MessageSquare,
    title: 'Negotiate with context',
    text: 'Clarify proposals and manage structured negotiations without losing history.',
  },
]

const supplierCapabilities = [
  {
    icon: FileCheck2,
    title: 'Discover relevant requests',
    text: 'Find procurement opportunities based on your capabilities and scope.',
  },
  {
    icon: Send,
    title: 'Submit structured bids',
    text: 'Respond manually or use AI-assisted extraction from existing proposal documents.',
  },
  {
    icon: BadgeCheck,
    title: 'Build procurement trust',
    text: 'Maintain accreditation information, proposal versions, and negotiation history.',
  },
]

function BuyerSupplierSection() {
  return (
    <section
      id="suppliers"
      className="relative overflow-hidden bg-[var(--bg-primary)] py-24 text-[var(--text-primary)] transition-colors duration-300 sm:py-32"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D47A3A]/[0.025] blur-[150px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(23,32,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(23,32,42,0.02)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <div>
            <div className="flex items-center gap-3">
  <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--text-muted)]">
    05
  </span>

  <span className="h-px w-8 bg-[var(--border)]" />

  <p className="text-xs font-bold tracking-[0.18em] text-[#D47A3A]">
    ONE PROCUREMENT NETWORK
  </p>
</div>

            <div className="mt-5 h-px w-16 bg-[#D47A3A]" />
          </div>

          <div>
            <h2 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[58px]">
  One procurement network.
  <span className="mt-2 block text-[var(--text-secondary)]">
    Two connected workspaces.
  </span>
</h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
  Buyers and suppliers work from different perspectives, but the same
  structured procurement lifecycle keeps requirements, proposals,
  negotiations, and decisions connected.
</p>
          </div>
        </div>

        {/* Two sides */}
        <div className="relative mt-16 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          {/* Buyer */}
          <div className="group rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#D47A3A]/30 hover:shadow-xl sm:p-9">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#D47A3A]/20 bg-[#D47A3A]/[0.06] px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] text-[#D47A3A]">
                  BUYER
                </span>

                <h3 className="mt-5 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                  From requirement
                  <br />
                  to award.
                </h3>

                <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                  Keep the procurement process centered around your
                  organization’s actual energy requirements and evaluation
                  criteria.
                </p>
              </div>

              <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-[#D47A3A]/10 sm:flex">
                <BarChart3 size={20} className="text-[#D47A3A]" />
              </div>
            </div>

            <div className="mt-9 space-y-3">
              {buyerCapabilities.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D47A3A]/10">
                      <Icon size={15} className="text-[#D47A3A]" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-[#D47A3A]">
              Buyer workspace
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Supplier */}
          <div className="group rounded-[20px] border border-[var(--border)] bg-[var(--bg-secondary)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5FF]/25 hover:shadow-xl sm:p-9">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/[0.06] px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] text-[#00B8CC] dark:text-[#00E5FF]">
                  SUPPLIER
                </span>

                <h3 className="mt-5 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                  From capability
                  <br />
                  to proposal.
                </h3>

                <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                  Give qualified suppliers a structured way to discover
                  opportunities, submit proposals, and participate in
                  transparent negotiations.
                </p>
              </div>

              <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-[#00E5FF]/10 sm:flex">
                <ShieldCheck
                  size={20}
                  className="text-[#00B8CC] dark:text-[#00E5FF]"
                />
              </div>
            </div>

            <div className="mt-9 space-y-3">
              {supplierCapabilities.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00E5FF]/10">
                      <Icon
                        size={15}
                        className="text-[#00B8CC] dark:text-[#00E5FF]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-[#00B8CC] dark:text-[#00E5FF]">
              Supplier workspace
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Center connection */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-primary)] shadow-lg">
              <ArrowRight size={15} className="text-[var(--text-muted)]" />
            </div>
          </div>
        </div>

        {/* Connection statement */}
        <div className="mx-auto mt-12 max-w-2xl text-center">
          <div className="mx-auto mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[var(--border)]" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#D47A3A]" />

            <span className="h-px w-12 bg-[var(--border)]" />
          </div>

          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Buyer requirements become supplier opportunities. Supplier
            proposals become buyer decisions. SOLVRA keeps the workflow
            connected from both sides.
          </p>
        </div>
      </div>
    </section>
  )
}

export default BuyerSupplierSection
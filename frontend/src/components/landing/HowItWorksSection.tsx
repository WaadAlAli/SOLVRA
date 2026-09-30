import {
  ArrowRight,
  Check,
  FileSearch,
  GitCompare,
  MessageSquare,
  ScanSearch,
  Send,
  Sparkles,
  Trophy,
} from 'lucide-react'

const steps = [
  {
    number: '01',
    label: 'DESCRIBE',
    title: 'Start with what you actually need.',
    description:
      'Describe your energy usage, operating conditions, backup needs, and priorities in plain language.',
    icon: MessageSquare,
    ai: true,
  },
  {
    number: '02',
    label: 'STRUCTURE',
    title: 'Turn the requirement into something suppliers can act on.',
    description:
      'AI helps translate the request into structured technical parameters that can be reviewed and confirmed by the buyer.',
    icon: Sparkles,
    ai: true,
  },
  {
    number: '03',
    label: 'REQUEST',
    title: 'Publish one clear procurement requirement.',
    description:
      'Suppliers receive a standardized request instead of a fragmented description or informal conversation.',
    icon: Send,
    ai: false,
  },
  {
    number: '04',
    label: 'BID',
    title: 'Collect comparable proposals.',
    description:
      'Suppliers submit structured proposals or upload existing documents for AI-assisted extraction and review.',
    icon: FileSearch,
    ai: true,
  },
  {
    number: '05',
    label: 'EVALUATE',
    title: 'Apply the criteria that matter to you.',
    description:
      'Configure evaluation weights and let deterministic scoring calculate results consistently across proposals.',
    icon: ScanSearch,
    ai: false,
  },
  {
    number: '06',
    label: 'COMPARE',
    title: 'See the differences without digging through PDFs.',
    description:
      'Normalized technical and commercial information appears in a side-by-side comparison matrix.',
    icon: GitCompare,
    ai: false,
  },
  {
    number: '07',
    label: 'NEGOTIATE',
    title: 'Move from comparison to conversation.',
    description:
      'Discuss proposals, request clarification, and work with structured counterproposals while preserving versions.',
    icon: MessageSquare,
    ai: false,
  },
  {
    number: '08',
    label: 'AWARD',
    title: 'Make a decision you can explain.',
    description:
      'Select the winning proposal and preserve the decision context through an auditable procurement trail.',
    icon: Trophy,
    ai: false,
  },
]

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[var(--bg-primary)] py-24 text-[var(--text-primary)] transition-colors duration-300 sm:py-32"
    >
      {/* Background atmosphere */}{' '}
      <div className="pointer-events-none absolute inset-0">
        {' '}
        <div className="absolute left-[-240px] top-1/3 h-[500px] w-[500px] rounded-full bg-[#D47A3A]/[0.035] blur-[140px]" />
        <div className="absolute right-[-180px] bottom-0 h-[500px] w-[500px] rounded-full bg-[#00E5FF]/[0.025] blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(23,32,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(23,32,42,0.025)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Introduction */}
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--text-muted)]">
                02
              </span>

              <span className="h-px w-8 bg-[var(--border)]" />

              <p className="text-xs font-bold tracking-[0.18em] text-[#D47A3A]">
                THE SOLVRA METHOD
              </p>
            </div>

            <div className="mt-5 h-px w-16 bg-[#D47A3A]" />
          </div>

          <div>
            <h2 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[58px]">
              One procurement workflow.
              <span className="mt-2 block text-[var(--text-secondary)]">
                From the first requirement to the final decision.
              </span>
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
              SOLVRA connects every stage of solar procurement without removing
              the people responsible for the decision.
            </p>
          </div>
        </div>

        {/* AI / deterministic legend */}
        <div className="mt-16 flex flex-wrap items-center gap-6 border-y border-[var(--border)] py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00E5FF]/10">
              <Sparkles size={13} className="text-[#00E5FF]" />
            </span>

            <div>
              <p className="text-[10px] font-bold tracking-[0.12em] text-[var(--text-primary)]">
                AI-ASSISTED
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                Interprets, extracts, summarizes
              </p>
            </div>
          </div>

          <div className="hidden h-8 w-px bg-[var(--border)] sm:block" />

          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
              <Check size={13} className="text-[#D47A3A]" />
            </span>

            <div>
              <p className="text-[10px] font-bold tracking-[0.12em] text-[var(--text-primary)]">
                SYSTEM-CONTROLLED
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                Validates, scores, records
              </p>
            </div>
          </div>
        </div>

        {/* Journey */}
        <div className="relative mt-16">
          {/* Vertical line */}
          <div className="absolute bottom-8 left-[19px] top-8 hidden w-px bg-[var(--border)] md:block" />

          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon

              return (
                <div
                  key={step.number}
                  className="group relative grid gap-5 md:grid-cols-[40px_100px_1fr_auto] md:items-center md:gap-6"
                >
                  {/* Timeline node */}
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-primary)]">
                    <span className="text-[9px] font-bold text-[var(--text-muted)]">
                      {step.number}
                    </span>
                  </div>

                  {/* Stage */}
                  <div className="pl-1 md:pl-0">
                    <p
                      className={`text-[10px] font-bold tracking-[0.16em] ${
                        step.ai
                          ? 'text-[#00B8CC] dark:text-[#00E5FF]'
                          : 'text-[#D47A3A]'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>

                  {/* Main content */}
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/70 p-5 transition-all duration-300 group-hover:border-[var(--border-strong)] group-hover:bg-[var(--bg-secondary)] sm:p-6">
                    <div className="flex gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          step.ai
                            ? 'border border-[#00E5FF]/20 bg-[#00E5FF]/10 text-[#00B8CC] dark:text-[#00E5FF]'
                            : 'bg-[#D47A3A]/10 text-[#D47A3A]'
                        }`}
                      >
                        <Icon size={17} />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[var(--text-primary)] sm:text-lg">
                          {step.title}
                        </h3>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI / System marker */}
                  <div className="hidden items-center justify-end md:flex">
                    {step.ai ? (
                      <span className="rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-3 py-1.5 text-[8px] font-bold tracking-[0.1em] text-[#00B8CC] dark:text-[#00E5FF]">
                        AI ASSISTED
                      </span>
                    ) : (
                      <span className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-[8px] font-bold tracking-[0.1em] text-[var(--text-muted)]">
                        SYSTEM LOGIC
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Principle */}
        <div className="mt-20 overflow-hidden rounded-[20px] border border-[#D47A3A]/20 bg-[#D47A3A]/[0.045] p-7 sm:mt-24 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-bold tracking-[0.16em] text-[#D47A3A]">
                THE CORE PRINCIPLE
              </p>

              <h3 className="mt-3 max-w-3xl text-2xl font-bold leading-tight tracking-[-0.02em] text-[var(--text-primary)] sm:text-3xl">
                AI interprets.
                <span className="text-[#D47A3A]"> The backend decides.</span>
                <br />
                You stay in control.
              </h3>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                AI can help understand requirements and proposals, but objective
                scoring, validation, permissions, and final procurement
                decisions remain controlled by SOLVRA's system logic and the
                people using it.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D47A3A] text-white">
                <ArrowRight size={15} />
              </span>
              Decision support,
              <br />
              not decision replacement.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection

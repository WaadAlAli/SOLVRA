import {
  ArrowDown,
  Check,
  FileCheck2,
  LockKeyhole,
  Scale,
  Sparkles,
} from 'lucide-react'

const stages = [
  {
    number: '01',
    label: 'AI INTERPRETS',
    title: 'Understand unstructured information.',
    description:
      'AI can extract requirements from natural language and information from supplier documents.',
    icon: Sparkles,
    ai: true,
  },
  {
    number: '02',
    label: 'HUMAN CONFIRMS',
    title: 'Critical information stays reviewable.',
    description:
      'Users can inspect, edit, and confirm AI-generated values before they become part of the procurement record.',
    icon: Check,
    ai: false,
  },
  {
    number: '03',
    label: 'SYSTEM VALIDATES',
    title: 'Business rules remain deterministic.',
    description:
      'The backend validates inputs, permissions, data integrity, and allowed workflow transitions.',
    icon: FileCheck2,
    ai: false,
  },
  {
    number: '04',
    label: 'SYSTEM CALCULATES',
    title: 'Objective scoring stays reproducible.',
    description:
      'Configured evaluation criteria and weighting drive the formal scoring process — not an AI opinion.',
    icon: Scale,
    ai: false,
  },
  {
    number: '05',
    label: 'AUDIT RECORDS',
    title: 'The decision context stays traceable.',
    description:
      'Versions, negotiations, confirmations, and award actions remain part of the procurement history.',
    icon: LockKeyhole,
    ai: false,
  },
]

function TrustGovernanceSection() {
  return (
    <section
      id="trust"
      className="relative overflow-hidden bg-[var(--bg-primary)] py-24 text-[var(--text-primary)] transition-colors duration-300 sm:py-32"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-200px] top-1/4 h-[500px] w-[500px] rounded-full bg-[#00E5FF]/[0.025] blur-[150px]" />

        <div className="absolute left-[-200px] bottom-0 h-[500px] w-[500px] rounded-full bg-[#D47A3A]/[0.025] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section heading */}
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--text-muted)]">
                06
              </span>

              <span className="h-px w-12 bg-[var(--border)]" />

              <p className="text-xs font-bold tracking-[0.18em] text-[#D47A3A]">
                TRUST & GOVERNANCE
              </p>
            </div>

            <div className="mt-5 h-px w-16 bg-[#D47A3A]" />
          </div>

          <div>
            <h2 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[58px]">
              Intelligence without
              <span className="mt-2 block text-[var(--text-secondary)]">
                giving up control.
              </span>
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
              SOLVRA uses AI where interpretation helps — while keeping
              validation, scoring, permissions, and final decisions within
              controlled system logic.
            </p>
          </div>
        </div>

        {/* Principle banner */}
        <div className="mt-16 rounded-[20px] border border-[#00E5FF]/15 bg-[#00E5FF]/[0.025] p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00E5FF]/10">
                <Sparkles
                  size={18}
                  className="text-[#00B8CC] dark:text-[#00E5FF]"
                />
              </div>

              <div>
                <p className="text-[9px] font-bold tracking-[0.16em] text-[#00B8CC] dark:text-[#00E5FF]">
                  SOLVRA PRINCIPLE
                </p>

                <p className="mt-1 text-base font-bold text-[var(--text-primary)]">
                  AI interprets. The backend decides.
                </p>
              </div>
            </div>

            <p className="max-w-lg text-xs leading-5 text-[var(--text-secondary)]">
              AI-generated information remains visibly distinguishable from
              system-controlled procurement data.
            </p>
          </div>
        </div>

        {/* Governance flow */}
        <div className="relative mt-14">
          {/* Connecting line */}
          <div className="absolute left-[27px] top-8 hidden h-[calc(100%-64px)] w-px bg-[var(--border)] md:block" />

          <div className="space-y-4">
            {stages.map((stage, index) => {
              const Icon = stage.icon

              return (
                <div key={stage.number}>
                  <div
                    className={`group relative grid gap-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] sm:p-6 md:grid-cols-[56px_180px_1fr] md:items-center md:gap-7 ${
                      stage.ai ? 'border-[#00E5FF]/15' : ''
                    }`}
                  >
                    {/* Number */}
                    <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-primary)]">
                      <span className="text-[9px] font-bold text-[var(--text-muted)]">
                        {stage.number}
                      </span>
                    </div>

                    {/* Label */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          stage.ai ? 'bg-[#00E5FF]/10' : 'bg-[#D47A3A]/10'
                        }`}
                      >
                        <Icon
                          size={15}
                          className={
                            stage.ai
                              ? 'text-[#00B8CC] dark:text-[#00E5FF]'
                              : 'text-[#D47A3A]'
                          }
                        />
                      </div>

                      <div>
                        <p
                          className={`text-[9px] font-bold tracking-[0.14em] ${
                            stage.ai
                              ? 'text-[#00B8CC] dark:text-[#00E5FF]'
                              : 'text-[#D47A3A]'
                          }`}
                        >
                          {stage.label}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] sm:text-lg">
                        {stage.title}
                      </h3>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                        {stage.description}
                      </p>
                    </div>
                  </div>

                  {/* Flow indicator */}
                  {index !== stages.length - 1 && (
                    <div className="flex justify-center py-2 md:hidden">
                      <ArrowDown
                        size={13}
                        className="text-[var(--text-muted)]"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom statement */}
        <div className="mt-16 grid gap-6 border-t border-[var(--border)] pt-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              Human-in-the-loop
            </p>

            <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
              AI suggestions can be reviewed and corrected before saving.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              Deterministic scoring
            </p>

            <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
              Formal evaluation follows configured criteria and weights.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              Traceable decisions
            </p>

            <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">
              Procurement activity remains connected to its history.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrustGovernanceSection

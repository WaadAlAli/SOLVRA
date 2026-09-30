import { ArrowUpRight, CheckCircle2 } from 'lucide-react'

const points = [
  'Turn your energy needs into a structured request.',
  'Compare supplier proposals on the criteria that matter.',
  'Keep the procurement decision transparent and traceable.',
]

function FinalCTASection() {
  return (
    <section
      id="start"
      className="relative overflow-hidden bg-[var(--bg-primary)] py-24 text-[var(--text-primary)] transition-colors duration-300 sm:py-32"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D47A3A]/[0.045] blur-[160px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(23,32,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(23,32,42,0.02)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
        {/* Section marker */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--text-muted)]">
            07
          </span>

          <span className="h-px w-12 bg-[var(--border)]" />

          <span className="text-xs font-bold tracking-[0.18em] text-[#D47A3A]">
            START WITH SOLVRA
          </span>

          <span className="h-px w-12 bg-[var(--border)]" />
        </div>

        {/* Heading */}
        <h2 className="mx-auto mt-8 max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-[68px]">
          Your next solar procurement
          <span className="mt-2 block text-[var(--text-secondary)]">
            deserves a clearer process.
          </span>
        </h2>

        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
          Turn complex energy requirements and supplier proposals into a
          structured procurement process built for better decisions.
        </p>

        {/* CTA buttons */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#D47A3A] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#D47A3A]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#BD6830] hover:shadow-xl hover:shadow-[#D47A3A]/25"
          >
            Start a Solar Request
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-secondary)] px-6 py-3.5 text-sm font-semibold text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D47A3A]/30"
          >
            Explore Supplier Portal
          </button>
        </div>

        {/* Supporting points */}
        <div className="mt-12 grid gap-3 border-t border-[var(--border)] pt-8 sm:grid-cols-3">
          {points.map((point) => (
            <div
              key={point}
              className="flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]"
            >
              <CheckCircle2 size={14} className="shrink-0 text-[#D47A3A]" />
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FinalCTASection

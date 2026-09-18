import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen overflow-hidden bg-[#0A0E17] text-white"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-280px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#D47A3A]/10 blur-[140px]" />

        <div className="absolute bottom-[-300px] right-[-200px] h-[600px] w-[600px] rounded-full bg-[#00E5FF]/[0.035] blur-[140px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-36 lg:px-8 lg:pb-24 lg:pt-44">
        <div className="grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          {/* Left side */}
          <div>
            {/* Eyebrow */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00E5FF]/10">
                <Sparkles size={11} className="text-[#00E5FF]" />
              </span>

              <span className="text-xs font-semibold tracking-[0.12em] text-white/65">
                AI-ASSISTED SOLAR PROCUREMENT
              </span>
            </div>

            {/* Main heading */}
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.045em] text-[#F5F4EE] sm:text-6xl lg:text-[76px]">
              Solar procurement,
              <span className="block text-white/45">
                without the complexity.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
              Turn energy requirements into structured solar requests,
              evaluate supplier proposals, and make transparent procurement
              decisions with AI-assisted intelligence.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-[11px] bg-[#D47A3A] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_35px_rgba(212,122,58,0.18)] transition hover:bg-[#bd6830]"
              >
                Start a Solar Request
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-[11px] border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                Explore how it works
                <ChevronRight size={17} />
              </a>
            </div>

            {/* Trust statement */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/45">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#00E5FF]" />
                Human-controlled decisions
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#00E5FF]" />
                Transparent evaluation
              </span>
            </div>
          </div>

          {/* Right side — product preview */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-8 rounded-[32px] bg-[#D47A3A]/5 blur-3xl" />

            <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#111722] shadow-2xl">
              {/* Browser / application chrome */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>

                <div className="text-[10px] font-semibold tracking-[0.16em] text-white/30">
                  SOLVRA WORKSPACE
                </div>

                <div className="w-10" />
              </div>

              {/* Dashboard */}
              <div className="grid min-h-[450px] grid-cols-[150px_1fr]">
                {/* Sidebar */}
                <aside className="hidden border-r border-white/10 bg-[#0D121C] p-4 sm:block">
                  <div className="mb-8 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D47A3A]">
                      <span className="text-[10px] font-bold">S</span>
                    </div>

                    <span className="text-xs font-bold tracking-[0.14em]">
                      SOLVRA
                    </span>
                  </div>

                  <div className="space-y-1">
                    {[
                      'Dashboard',
                      'Requests',
                      'Received Bids',
                      'Evaluation',
                      'Comparisons',
                      'Negotiations',
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-lg px-3 py-2.5 text-[10px] font-medium ${
                          index === 0
                            ? 'bg-white/[0.07] text-white'
                            : 'text-white/35'
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>

                {/* Main dashboard */}
                <div className="min-w-0 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-medium text-white/35">
                        ACTIVE REQUEST
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-white">
                        Commercial Solar Project
                      </h3>
                    </div>

                    <span className="rounded-full border border-[#D47A3A]/25 bg-[#D47A3A]/10 px-2.5 py-1 text-[9px] font-semibold text-[#E39A68]">
                      EVALUATING
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
                      <p className="text-[9px] font-medium text-white/35">
                        PV CAPACITY
                      </p>

                      <p className="mt-2 text-xl font-semibold text-white">
                        8.5
                        <span className="ml-1 text-xs text-white/40">
                          kW
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
                      <p className="text-[9px] font-medium text-white/35">
                        STORAGE
                      </p>

                      <p className="mt-2 text-xl font-semibold text-white">
                        15
                        <span className="ml-1 text-xs text-white/40">
                          kWh
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
                      <p className="text-[9px] font-medium text-white/35">
                        BACKUP TARGET
                      </p>

                      <p className="mt-2 text-xl font-semibold text-white">
                        12
                        <span className="ml-1 text-xs text-white/40">
                          hrs
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
                      <p className="text-[9px] font-medium text-white/35">
                        PROPOSALS
                      </p>

                      <p className="mt-2 text-xl font-semibold text-white">
                        6
                      </p>
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="mt-4 rounded-xl border border-[#00E5FF]/20 bg-[#00E5FF]/[0.035] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#00E5FF]/20 bg-[#00E5FF]/10">
                          <Sparkles
                            size={13}
                            className="text-[#00E5FF]"
                          />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold tracking-[0.1em] text-[#00E5FF]">
                            AI INSIGHT
                          </p>

                          <p className="text-[10px] font-semibold text-white/75">
                            Requirement structured
                          </p>
                        </div>
                      </div>

                      <span className="text-[8px] font-semibold text-white/30">
                        CONFIRM TO SAVE
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/[0.035] px-3 py-2">
                        <p className="text-[8px] text-white/30">
                          LOAD PROFILE
                        </p>
                        <p className="mt-1 text-[9px] font-semibold text-white/70">
                          Night-heavy
                        </p>
                      </div>

                      <div className="rounded-lg bg-white/[0.035] px-3 py-2">
                        <p className="text-[8px] text-white/30">
                          BACKUP
                        </p>
                        <p className="mt-1 text-[9px] font-semibold text-white/70">
                          Required
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-medium text-white/35">
                        PROCUREMENT PROGRESS
                      </p>

                      <p className="text-[9px] font-semibold text-white/50">
                        4 / 6
                      </p>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[67%] rounded-full bg-[#D47A3A]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating AI indicator */}
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-[#00E5FF]/20 bg-[#111722] px-4 py-3 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E5FF] opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00E5FF]" />
                </span>

                <div>
                  <p className="text-[9px] font-bold tracking-[0.1em] text-[#00E5FF]">
                    AI ASSISTED
                  </p>

                  <p className="mt-0.5 text-[9px] text-white/40">
                    Human confirmation required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom statement */}
        <div className="mt-20 border-t border-white/10 pt-7 lg:mt-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-5 text-white/35">
              Built for organizations that need clarity across technical
              requirements, supplier proposals, pricing, and procurement
              decisions.
            </p>

            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em] text-white/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D47A3A]" />
              PROCUREMENT DECISION SUPPORT
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
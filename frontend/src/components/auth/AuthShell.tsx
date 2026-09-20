import type { ReactNode } from 'react'
import {
  ArrowLeft,
  BarChart3,
  Check,
  CircleDollarSign,
  FileCheck2,
  Sparkles,
  SunMedium,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import ThemeToggle from '../ui/ThemeToggle'

interface AuthShellProps {
  children: ReactNode
  title: string
  subtitle: string
  footer: ReactNode
}

function AuthShell({
  children,
  title,
  subtitle,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">

        {/* SOLVRA intelligence panel */}
        <section className="relative hidden w-[48%] overflow-hidden bg-[#0A0E17] px-10 py-10 text-white lg:flex lg:flex-col xl:px-14">

          {/* subtle grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* ambient glow */}
          <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-[#00E5FF]/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-[#D47A3A]/[0.08] blur-3xl" />

          {/* Logo */}
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <span className="text-xs font-bold tracking-[0.18em]">
                  SV
                </span>
              </div>

              <span className="text-lg font-semibold tracking-[0.16em]">
                SOLVRA
              </span>
            </Link>
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-1 items-center">
            <div className="w-full max-w-xl">

              <div className="mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
                  Procurement intelligence
                </p>
              </div>

              <h2 className="max-w-lg text-4xl font-semibold leading-[1.04] tracking-[-0.045em] xl:text-5xl">
                From supplier proposals
                <span className="block text-white/45">
                  to one clear decision.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/45">
                SOLVRA turns complex solar requirements and supplier
                proposals into structured, comparable decisions.
              </p>

              {/* Decision visualization */}
              <div className="mt-10 max-w-md rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl">

                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                      Active evaluation
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      Commercial Solar System
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00E5FF]/20 bg-[#00E5FF]/5">
                    <Sparkles
                      size={14}
                      className="text-[#00E5FF]"
                    />
                  </div>
                </div>

                {/* bid rows */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] px-3 py-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                      <SunMedium size={13} />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/70">
                          Supplier proposal
                        </span>
                        <span className="text-white/45">
                          $24,800
                        </span>
                      </div>

                      <div className="mt-2 h-1 rounded-full bg-white/10">
                        <div className="h-1 w-[86%] rounded-full bg-[#D47A3A]" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] px-3 py-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                      <BarChart3 size={13} />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/70">
                          Weighted evaluation
                        </span>
                        <span className="text-[#00E5FF]">
                          91.4
                        </span>
                      </div>

                      <div className="mt-2 h-1 rounded-full bg-white/10">
                        <div className="h-1 w-[91%] rounded-full bg-[#00E5FF]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI insight */}
                <div className="mt-4 flex gap-3 border-t border-white/10 pt-4">
                  <Sparkles
                    size={14}
                    className="mt-0.5 shrink-0 text-[#00E5FF]"
                  />

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#00E5FF]">
                      AI insight
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-white/45">
                      Proposal differences have been normalized for
                      comparison.
                    </p>
                  </div>
                </div>
              </div>

              {/* principles */}
              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="border-l border-white/10 pl-3">
                  <FileCheck2
                    size={14}
                    className="mb-2 text-white/40"
                  />
                  <p className="text-[10px] text-white/45">
                    Structured
                  </p>
                </div>

                <div className="border-l border-white/10 pl-3">
                  <CircleDollarSign
                    size={14}
                    className="mb-2 text-white/40"
                  />
                  <p className="text-[10px] text-white/45">
                    Comparable
                  </p>
                </div>

                <div className="border-l border-white/10 pl-3">
                  <Check
                    size={14}
                    className="mb-2 text-white/40"
                  />
                  <p className="text-[10px] text-white/45">
                    Transparent
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center justify-between">
            <p className="text-[10px] tracking-[0.12em] text-white/25">
              AI interprets. The backend decides.
            </p>

            <p className="text-[10px] text-white/20">
              SOLVRA
            </p>
          </div>
        </section>

        {/* Form panel */}
        <section className="flex min-w-0 flex-1 flex-col">

          <header className="flex items-center justify-between px-6 py-6 sm:px-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] lg:hidden"
            >
              <ArrowLeft size={16} />
              Back
            </Link>

            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>

          <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
            <div className="w-full max-w-[460px]">

              <div className="mb-9">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
                  SOLVRA / Account
                </p>

                <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  {title}
                </h1>

                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {subtitle}
                </p>
              </div>

              {children}

              <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                {footer}
              </div>

            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AuthShell
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowUpRight, Circle, Orbit } from 'lucide-react'
import { Link } from 'react-router-dom'

import ThemeToggle from '../ui/ThemeToggle'

interface AuthShellProps {
  children: ReactNode
  title: string
  subtitle: string
  footer: ReactNode
  eyebrow?: string
}

function AuthShell({
  children,
  title,
  subtitle,
  footer,
  eyebrow = 'SOLVRA / ACCOUNT',
}: AuthShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="relative min-h-screen">
        {/* ───────────── Background architecture ───────────── */}

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(var(--text-primary) 1px, transparent 1px),
              linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />

        <div className="pointer-events-none absolute -left-[18rem] top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 rounded-full border border-[var(--copper)]/[0.10]" />
        <div className="pointer-events-none absolute -left-[14rem] top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full border border-[var(--copper)]/[0.08]" />
        <div className="pointer-events-none absolute -left-[10rem] top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full border border-[var(--copper)]/[0.07]" />

        {/* ───────────── Header ───────────── */}

        <header className="relative z-30 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-12">
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--text-primary)]/15">
              <div className="absolute inset-1 rounded-full border border-[var(--copper)]/40" />

              <span className="relative text-[9px] font-bold tracking-[0.15em]">
                SV
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[0.22em]">SOLVRA</p>

              <p className="hidden text-[8px] uppercase tracking-[0.18em] text-[var(--text-muted)] sm:block">
                Solar procurement intelligence
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
              Secure environment
            </div>

            <ThemeToggle />
          </div>
        </header>

        {/* ───────────── Main ───────────── */}

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-90px)] max-w-[1500px]">
          {/* ───────────── Visual side ───────────── */}

          <section className="relative hidden w-[52%] items-center overflow-hidden px-10 pb-20 lg:flex xl:px-16">
            {/* orbit system */}

            <div className="absolute left-[8%] top-1/2 h-[540px] w-[540px] -translate-y-1/2">
              <div className="absolute inset-0 rounded-full border border-[var(--text-primary)]/[0.08]" />

              <div className="absolute inset-[48px] rounded-full border border-[var(--copper)]/[0.12]" />

              <div className="absolute inset-[110px] rounded-full border border-[var(--text-primary)]/[0.07]" />

              <div className="absolute inset-[175px] rounded-full border border-[var(--copper)]/[0.10]" />

              {/* diagonal orbit */}

              <div className="absolute inset-[80px] rotate-[28deg] rounded-full border border-[var(--text-primary)]/[0.07]" />

              {/* orbiting node */}

              <div className="absolute left-[62px] top-[73px] h-2 w-2 rounded-full bg-[var(--copper)] shadow-[0_0_18px_rgba(212,122,58,0.5)]" />

              <div className="absolute bottom-[92px] right-[60px] h-1.5 w-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.5)]" />

              {/* center */}

              <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--text-primary)]/10 bg-[var(--bg-primary)]/80 backdrop-blur-sm">
                <div className="absolute inset-3 rounded-full border border-[var(--copper)]/25" />

                <div className="text-center"></div>
              </div>
            </div>

            {/* text */}

            <div className="relative z-10 max-w-[510px] pl-6">
              <div className="mb-8 flex items-center gap-3">
                <span className="h-px w-10 bg-[var(--copper)]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  Procurement intelligence
                </span>
              </div>

              <h2 className="max-w-xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] xl:text-6xl">
                Better bids.
                <span className="block text-[var(--text-secondary)]">
                  Clearer decisions.
                </span>
              </h2>

              <p className="mt-7 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
                SOLVRA transforms complex solar requirements and supplier
                proposals into structured decisions you can understand, compare,
                and act on.
              </p>

              <div className="mt-10 flex items-center gap-8">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    AI
                  </p>

                  <p className="mt-1 text-xs font-medium">Interprets</p>
                </div>

                <div className="h-8 w-px bg-[var(--border)]" />

                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Engine
                  </p>

                  <p className="mt-1 text-xs font-medium">Evaluates</p>
                </div>

                <div className="h-8 w-px bg-[var(--border)]" />

                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Buyer
                  </p>

                  <p className="mt-1 text-xs font-medium">Decides</p>
                </div>
              </div>
            </div>

            {/* vertical label */}

            <div className="absolute bottom-10 left-10 flex items-center gap-3 xl:left-16">
              <Orbit size={13} className="text-[var(--copper)]" />

              <span className="text-[9px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                AI interprets. The backend decides.
              </span>
            </div>
          </section>

          {/* ───────────── Form side ───────────── */}

          <section className="flex min-w-0 flex-1 items-center px-6 pb-14 pt-4 sm:px-10 lg:px-12">
            <div className="w-full max-w-[480px]">
              <div className="mb-8 lg:hidden">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)]"
                >
                  <ArrowLeft size={14} />
                  Back to SOLVRA
                </Link>
              </div>

              <div className="mb-9">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--copper)]">
                    {eyebrow}
                  </p>

                  <span className="text-[9px] tabular-nums text-[var(--text-muted)]">
                    01 — 04
                  </span>
                </div>

                <h1 className="text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-5xl">
                  {title}
                </h1>

                <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                  {subtitle}
                </p>
              </div>

              {children}

              <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)]">
                {footer}
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-[8px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                <Circle size={5} fill="currentColor" />
                Protected by SOLVRA security
              </div>
            </div>
          </section>
        </div>

        {/* corner mark */}

        <div className="pointer-events-none absolute bottom-6 right-8 hidden items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-[var(--text-muted)] lg:flex">
          <span>EST. 2026</span>
          <ArrowUpRight size={11} />
        </div>
      </div>
    </main>
  )
}

export default AuthShell

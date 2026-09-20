import {
  ArrowUpRight,
  Globe,
  Mail,
} from 'lucide-react'

const productLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Decision Intelligence', href: '#decision-intelligence' },
  { label: 'For Buyers', href: '#buyers' },
  { label: 'For Suppliers', href: '#suppliers' },
]

const platformLinks = [
  { label: 'Trust & Governance', href: '#trust' },
  { label: 'Security', href: '#' },
  { label: 'Audit & Compliance', href: '#' },
  { label: 'Documentation', href: '#' },
]

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Main footer */}
        <div className="grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-16 lg:py-16">
          {/* Brand */}
          <div>
            <a
              href="#"
              className="inline-flex items-center gap-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D47A3A] text-sm font-black text-white">
                S
              </span>

              <span className="text-sm font-black tracking-[0.16em]">
                SOLVRA
              </span>
            </a>

            <p className="mt-5 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
              AI-powered solar procurement and decision support for structured,
              transparent energy sourcing.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              >
                <Globe size={15} />
              </a>

              <a
                href="#"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--text-muted)]">
              PRODUCT
            </p>

            <nav className="mt-5 space-y-3">
              {productLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block w-fit text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Platform */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--text-muted)]">
              PLATFORM
            </p>

            <nav className="mt-5 space-y-3">
              {platformLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block w-fit text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--text-muted)]">
              GET STARTED
            </p>

            <div className="mt-5">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Ready to structure your next procurement?
              </p>

              <a
                href="#start"
                className="group mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#D47A3A]"
              >
                Start a Solar Request

                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-[var(--border)] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-[var(--text-muted)]">
            © 2026 SOLVRA. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-[11px] text-[var(--text-muted)]">
            <a
              href="#"
              className="transition-colors hover:text-[var(--text-primary)]"
            >
              Privacy
            </a>

            <a
              href="#"
              className="transition-colors hover:text-[var(--text-primary)]"
            >
              Terms
            </a>

            <span className="flex items-center gap-1.5">
              Built for better decisions
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
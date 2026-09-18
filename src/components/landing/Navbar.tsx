import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useState } from 'react'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="absolute left-0 right-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#top"
            className="flex items-center gap-3"
            aria-label="SOLVRA home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#D47A3A]">
              <span className="text-sm font-bold text-white">S</span>
            </div>

            <span className="text-lg font-bold tracking-[0.18em] text-white">
              SOLVRA
            </span>
          </a>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              How it works
            </a>

            <a
              href="#buyers"
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              For Buyers
            </a>

            <a
              href="#suppliers"
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              For Suppliers
            </a>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-4 md:flex">
            <a
              href="/login"
              className="text-sm font-semibold text-white/80 transition hover:text-white"
            >
              Sign in
            </a>

            <a
              href="/signup"
              className="group flex items-center gap-2 rounded-[10px] bg-[#D47A3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#bd6830]"
            >
              Start a Solar Request
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#111722] p-5 shadow-2xl md:hidden">
            <div className="flex flex-col gap-5">
              <a
                href="#how-it-works"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-white/75"
              >
                How it works
              </a>

              <a
                href="#buyers"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-white/75"
              >
                For Buyers
              </a>

              <a
                href="#suppliers"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-white/75"
              >
                For Suppliers
              </a>

              <div className="h-px bg-white/10" />

              <a
                href="/login"
                className="text-sm font-semibold text-white/80"
              >
                Sign in
              </a>

              <a
                href="/signup"
                className="flex items-center justify-center rounded-[10px] bg-[#D47A3A] px-5 py-3 text-sm font-semibold text-white"
              >
                Start a Solar Request
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
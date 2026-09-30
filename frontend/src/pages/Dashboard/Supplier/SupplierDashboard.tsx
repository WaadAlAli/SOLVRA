import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  ClipboardList,
  Loader2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import StatCard from '../../../components/dashboard/StatCard'
import { useAuth } from '../../../context/AuthContext'
import {
  getSupplierDashboard,
  type SupplierBid,
} from '../../../services/supplier.service'
import { getUserDisplayName } from '../../../utils/userDisplayName'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function SupplierDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeBids, setActiveBids] = useState<SupplierBid[]>([])
  const [stats, setStats] = useState({ openRequests: 0, activeBids: 0 })

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await getSupplierDashboard()
        setStats(response.stats)
        setActiveBids(response.recentBids ?? [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load supplier dashboard.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  const companyName = getUserDisplayName(user)

  return (
    <DashboardShell role="SUPPLIER">
      <div className="space-y-6">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
              Supplier / Overview
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Welcome, {companyName}.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
              Review open solar opportunities, submit competitive bids, and
              track your active proposals.
            </p>
          </div>

          <Link
            to="/supplier/requests"
            className="group inline-flex h-11 items-center justify-center gap-3 rounded-xl bg-[var(--copper)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)]"
          >
            View open requests
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] px-4 py-3 text-sm text-[var(--text-secondary)]">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Open requests"
            value={loading ? '—' : String(stats.openRequests)}
            description="Live opportunities for suppliers"
            icon={ClipboardList}
          />
          <StatCard
            label="Active bids"
            value={loading ? '—' : String(stats.activeBids)}
            description="Your proposals currently on file"
            icon={BriefcaseBusiness}
          />
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Recent bids</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Your latest submissions from the supplier workspace.
              </p>
            </div>
            <Link
              to="/supplier/bids"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--copper)]"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <div className="text-center">
                <Loader2
                  size={24}
                  className="mx-auto animate-spin text-[var(--copper)]"
                />
                <p className="mt-3 text-xs text-[var(--text-muted)]">
                  Loading your bids...
                </p>
              </div>
            </div>
          ) : activeBids.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center px-6 py-10 text-center">
              <div className="max-w-md">
                <p className="text-base font-medium">No bids yet</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Open requests will appear here once you start submitting
                  proposals.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {activeBids.map((bid) => (
                <div
                  key={bid.id}
                  className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {bid.request.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {bid.request.location} • {formatDate(bid.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      {bid.status}
                    </span>
                    <Link
                      to={`/supplier/bids/${bid.id}`}
                      className="text-xs font-medium text-[var(--copper)]"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  )
}

export default SupplierDashboard

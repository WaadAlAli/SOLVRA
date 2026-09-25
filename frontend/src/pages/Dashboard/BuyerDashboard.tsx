import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ClipboardPlus,
  FileSearch,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import DashboardShell from '../../components/dashboard/DashboardShell'
import StatCard from '../../components/dashboard/StatCard'
import { useAuth } from '../../context/AuthContext'
import {
  getBuyerDashboard,
  type BuyerDashboardRequest,
  type BuyerDashboardStats,
} from '../../services/buyer.service'
import { getUserDisplayName } from '../../utils/userDisplayName'

function BuyerDashboard() {
  const { user } = useAuth()

  const [stats, setStats] =
    useState<BuyerDashboardStats | null>(null)

  const [requests, setRequests] = useState<
    BuyerDashboardRequest[]
  >([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const displayName = getUserDisplayName(user)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await getBuyerDashboard()

        setStats(response.stats)
        setRequests(
          response.recentRequests ?? [],
        )
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'Unable to load your dashboard.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  const activeRequests =
    (stats?.openRequests ?? 0) +
    (stats?.evaluatingRequests ?? 0) +
    (stats?.negotiatingRequests ?? 0)

  const formatStatus = (status: string) => {
    return status
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      undefined,
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      },
    )
  }

  return (
    <DashboardShell role="BUYER">
      {/* Page heading */}
      <section className="mb-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
              Buyer / Overview
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Good morning, {displayName}.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              Manage your solar procurement, evaluate supplier
              proposals, and make decisions with clarity.
            </p>
          </div>

          <Link
            to="/dashboard/requests/new"
            className="group inline-flex h-11 items-center justify-center gap-3 rounded-xl bg-[var(--copper)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)]"
          >
            Create solar request

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.04] px-4 py-3 text-sm text-[var(--text-secondary)]">
          {error}
        </div>
      )}

      {/* Overview stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active requests"
          value={
            loading
              ? '—'
              : String(activeRequests)
          }
          description={
            activeRequests === 0
              ? 'No active procurement requests'
              : `${activeRequests} request${activeRequests === 1 ? '' : 's'} in progress`
          }
          icon={ClipboardPlus}
        />

        <StatCard
          label="Open requests"
          value={
            loading
              ? '—'
              : String(stats?.openRequests ?? 0)
          }
          description="Available for supplier bidding"
          icon={FileSearch}
        />

        <StatCard
          label="In negotiation"
          value={
            loading
              ? '—'
              : String(
                  stats?.negotiatingRequests ?? 0,
                )
          }
          description="Requests currently in negotiation"
          icon={ArrowRight}
        />

        <StatCard
          label="AI insights"
          value="—"
          description="Available as proposals are evaluated"
          icon={Sparkles}
          accent="ai"
        />
      </section>

      {/* Main content */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        {/* Requests */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <p className="text-sm font-semibold">
                Your solar requests
              </p>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Track the procurement lifecycle from request to award.
              </p>
            </div>

            <Link
              to="/dashboard/requests"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--copper)] transition hover:text-[var(--copper-hover)]"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="text-center">
                <Loader2
                  size={24}
                  className="mx-auto animate-spin text-[var(--copper)]"
                />

                <p className="mt-3 text-xs text-[var(--text-muted)]">
                  Loading requests...
                </p>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center px-6 py-10">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--text-primary)]/[0.025] text-[var(--copper)]">
                  <ClipboardPlus size={20} />
                </div>

                <h2 className="mt-5 text-base font-semibold">
                  Start your first solar request
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Tell SOLVRA what you need in plain language.
                  We'll help structure the requirements before
                  suppliers submit their proposals.
                </p>

                <Link
                  to="/dashboard/requests/new"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[var(--copper)]"
                >
                  Create a request
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  to={`/dashboard/requests/${request.id}`}
                  className="block px-5 py-5 transition hover:bg-[var(--text-primary)]/[0.025]"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="truncate text-sm font-semibold">
                          {request.title}
                        </h3>

                        <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          {formatStatus(
                            request.status,
                          )}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        {request.location} ·{' '}
                        {formatStatus(
                          request.propertyType,
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {formatDate(
                          request.createdAt,
                        )}
                      </span>

                      <ArrowRight
                        size={15}
                        className="text-[var(--text-muted)]"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* AI panel */}
        <div className="rounded-2xl border border-[#00E5FF]/15 bg-[var(--bg-secondary)]">
          <div className="border-b border-[#00E5FF]/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <Sparkles
                size={15}
                className="text-[#00E5FF]"
              />

              <p className="text-sm font-semibold">
                AI intelligence
              </p>
            </div>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Decision support, not automated decisions.
            </p>
          </div>

          <div className="px-5 py-6">
            <div className="rounded-xl border border-[#00E5FF]/10 bg-[#00E5FF]/[0.025] p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#00E5FF]">
                AI INSIGHT
              </p>

              <p className="mt-3 text-sm font-medium">
                Your intelligence layer is ready.
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                SOLVRA can interpret requirements, identify
                missing information, normalize supplier
                proposals, and surface relevant insights.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
              AI suggestions require your confirmation.
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Procurement lifecycle
            </p>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              SOLVRA keeps the decision process structured and auditable.
            </p>
          </div>

          <span className="text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Request → Award
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            'Describe',
            'Structure',
            'Request',
            'Bid',
            'Evaluate',
            'Compare',
            'Negotiate',
            'Award',
          ].map((step, index) => (
            <div
              key={step}
              className="relative"
            >
              <div className="rounded-xl border border-[var(--border)] px-3 py-3">
                <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  0{index + 1}
                </p>

                <p className="mt-2 text-xs font-medium">
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  )
}

export default BuyerDashboard
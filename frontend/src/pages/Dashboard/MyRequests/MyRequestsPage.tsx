import {
  CalendarDays,
  ChevronRight,
  FilePlus2,
  MapPin,
  Pencil,
  Search,
  Trash2,
  Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import {
  deleteRequest,
  getMyRequests,
  type SolarRequest,
} from '../../../services/request.service'

type FilterStatus =
  'ALL' | 'DRAFT' | 'OPEN' | 'EVALUATING' | 'NEGOTIATING' | 'AWARDED'

function formatStatus(status: string) {
  return status.replace(/_/g, ' ')
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusClasses(status: string) {
  switch (status) {
    case 'OPEN':
      return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'

    case 'EVALUATING':
      return 'border-blue-500/20 bg-blue-500/5 text-blue-500'

    case 'NEGOTIATING':
      return 'border-purple-500/20 bg-purple-500/5 text-purple-500'

    case 'AWARDED':
      return 'border-cyan-500/20 bg-cyan-500/5 text-cyan-500'

    default:
      return 'border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-muted)]'
  }
}

function MyRequestsPage() {
  const navigate = useNavigate()

  const [requests, setRequests] = useState<SolarRequest[]>([])
  const [filter, setFilter] = useState<FilterStatus>('ALL')
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)

  const loadRequests = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getMyRequests()

      if (!response.success) {
        throw new Error('Unable to load your requests.')
      }

      setRequests(response.requests)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load your requests.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return requests.filter((request) => {
      const matchesStatus = filter === 'ALL' || request.status === filter

      const matchesSearch =
        !normalizedSearch ||
        request.title.toLowerCase().includes(normalizedSearch) ||
        request.location.toLowerCase().includes(normalizedSearch) ||
        request.propertyType.toLowerCase().includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [requests, filter, search])

  const handleDelete = async (request: SolarRequest) => {
    const confirmed = window.confirm(
      `Delete "${request.title}"? This action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(request.id)
      setActionError('')

      await deleteRequest(request.id)

      setRequests((current) => current.filter((item) => item.id !== request.id))
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to delete request.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleOpen = async (request: SolarRequest) => {
    if (request.status !== 'DRAFT') {
      return
    }

    try {
      setOpeningId(request.id)
      setActionError('')

      navigate('/dashboard/requests/new', {
        state: { draftRequestId: request.id },
      })
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to resume request.',
      )
    } finally {
      setOpeningId(null)
    }
  }

  return (
    <DashboardShell role="BUYER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">
              Procurement
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
              My Requests
            </h1>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Manage your solar procurement requests and their lifecycle.
            </p>
          </div>

          <Link
            to="/dashboard/requests/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--text-primary)] px-4 py-2.5 text-xs font-semibold text-[var(--bg-primary)] transition hover:opacity-90"
          >
            <FilePlus2 size={15} />
            New request
          </Link>
        </div>

        {/* Search + filters */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search requests..."
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] pl-9 pr-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--copper)]/50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {(
                [
                  'ALL',
                  'DRAFT',
                  'OPEN',
                  'EVALUATING',
                  'NEGOTIATING',
                  'AWARDED',
                ] as FilterStatus[]
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] transition ${
                    filter === status
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--text-primary)]/[0.04] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {status === 'ALL' ? 'All' : formatStatus(status)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {actionError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
            {actionError}
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-32 rounded bg-[var(--text-primary)]/10" />
              <div className="h-20 rounded-xl bg-[var(--text-primary)]/10" />
              <div className="h-20 rounded-xl bg-[var(--text-primary)]/10" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-sm font-semibold text-red-500">
              Unable to load requests
            </p>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>

            <button
              type="button"
              onClick={() => void loadRequests()}
              className="mt-4 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                {filteredRequests.length}{' '}
                {filteredRequests.length === 1 ? 'request' : 'requests'}
              </p>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--copper)]/10 text-[var(--copper)]">
                  <Zap size={20} />
                </div>

                <h2 className="mt-4 text-sm font-semibold">
                  No requests found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[var(--text-muted)]">
                  {requests.length === 0
                    ? 'Create your first solar procurement request to start receiving supplier proposals.'
                    : 'Try another search or status filter.'}
                </p>

                {requests.length === 0 && (
                  <Link
                    to="/dashboard/requests/new"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--text-primary)] px-4 py-2.5 text-xs font-semibold text-[var(--bg-primary)]"
                  >
                    <FilePlus2 size={14} />
                    Create request
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 transition hover:border-[var(--text-primary)]/15"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <Link
                        to={`/dashboard/requests/${request.id}`}
                        className="min-w-0 flex-1"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="truncate text-base font-semibold">
                            {request.title}
                          </h2>

                          <span
                            className={`rounded-full border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${statusClasses(
                              request.status,
                            )}`}
                          >
                            {formatStatus(request.status)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-[var(--text-muted)]">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} />
                            {request.location}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Zap size={12} />
                            {formatStatus(request.propertyType)}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={12} />
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                      </Link>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        {request.status === 'DRAFT' && (
                          <>
                            <Link
                              to={`/dashboard/requests/${request.id}/edit`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-[10px] font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                            >
                              <Pencil size={13} />
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => void handleOpen(request)}
                              disabled={openingId === request.id}
                              className="rounded-lg bg-[var(--copper)] px-3 py-2 text-[10px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                            >
                              {openingId === request.id
                                ? 'Opening...'
                                : 'Review & Open'}
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleDelete(request)}
                              disabled={deletingId === request.id}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/15 text-red-500 transition hover:bg-red-500/5 disabled:opacity-50"
                              aria-label="Delete request"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}

                        <Link
                          to={`/dashboard/requests/${request.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                          aria-label="View request"
                        >
                          <ChevronRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </DashboardShell>
  )
}

export default MyRequestsPage

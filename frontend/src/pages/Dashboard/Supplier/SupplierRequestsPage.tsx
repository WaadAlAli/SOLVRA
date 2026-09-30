import { useEffect, useState } from 'react'
import { ArrowLeft, Building2, MapPin, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import {
  getSupplierOpenRequests,
  type SupplierRequest,
} from '../../../services/supplier.service'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function SupplierRequestsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<SupplierRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await getSupplierOpenRequests()
        setRequests(response.requests ?? [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load open requests.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadRequests()
  }, [])

  return (
    <DashboardShell role="SUPPLIER">
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/supplier')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </button>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">
              Supplier
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
              Open solar requests
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-muted)]">
            <Search size={14} />
            {requests.length} requests available
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-sm text-[var(--text-secondary)]">
            Loading open requests...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-4 xl:grid-cols-2">
            {requests.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-10 text-center">
                <p className="text-lg font-semibold">
                  No open requests right now
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  New buyer solar requests will appear here when they are opened
                  for bidding.
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--copper)]">
                        {request.status}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">
                        {request.title}
                      </h2>
                    </div>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      {request._count?.bids ?? 0} bids
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[var(--copper)]" />
                      {request.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-[var(--copper)]" />
                      {request.propertyType}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      Posted {formatDate(request.createdAt)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                    <div className="text-sm">
                      <span className="text-[var(--text-muted)]">Budget:</span>{' '}
                      <span className="font-semibold">
                        {request.budget ?? 'Not specified'}
                      </span>
                    </div>
                    <Link
                      to={`/supplier/requests/${request.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold transition hover:bg-[var(--text-primary)]/[0.04]"
                    >
                      Review request
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

export default SupplierRequestsPage

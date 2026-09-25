import { useEffect, useState } from 'react'
import { ArrowLeft, Building2, ClipboardList, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import { getMySupplierBids, type SupplierBid } from '../../../services/supplier.service'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function SupplierBidsPage() {
  const navigate = useNavigate()
  const [bids, setBids] = useState<SupplierBid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadBids = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await getMySupplierBids()
        setBids(response.bids ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load your bids.')
      } finally {
        setLoading(false)
      }
    }

    void loadBids()
  }, [])

  return (
    <DashboardShell role="SUPPLIER">
      <div className="space-y-6">
        <button type="button" onClick={() => navigate('/supplier')} className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]">
          <ArrowLeft size={15} />
          Back to dashboard
        </button>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">Supplier</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">My bids</h1>
        </div>

        {loading && <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-sm text-[var(--text-secondary)]">Loading your bids...</div>}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid gap-4 xl:grid-cols-2">
            {bids.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--copper)]">
                  <ClipboardList size={20} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">No bids submitted</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Submit a bid on an open request to track it here.</p>
              </div>
            ) : (
              bids.map((bid) => (
                <article key={bid.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--copper)]">{bid.status}</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em]">{bid.request.title}</h3>
                    </div>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      {bid.latestVersion?.totalPrice ?? '—'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[var(--copper)]" />
                      {bid.request.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-[var(--copper)]" />
                      {bid.request.propertyType}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Submitted {formatDate(bid.createdAt)}</p>
                  </div>

                  <div className="mt-4 border-t border-[var(--border)] pt-4">
                    <Link to={`/supplier/bids/${bid.id}`} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold transition hover:bg-[var(--text-primary)]/[0.04]">
                      View bid details
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

export default SupplierBidsPage

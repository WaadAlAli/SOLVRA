import {
  ArrowRight,
  Building2,
  FileText,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import {
  getMyRequests,
  type SolarRequest,
} from '../../../services/request.service'
import { getRequestBids, type RequestBid } from '../../../services/bid.service'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return 'Not specified'
  }

  return String(value)
}

function BidsPage() {
  const [requests, setRequests] = useState<SolarRequest[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [bids, setBids] = useState<RequestBid[]>([])
  const [requestStatus, setRequestStatus] = useState('')
  const [requestLocation, setRequestLocation] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getMyRequests()

        if (!response.success) {
          throw new Error('Unable to load requests.')
        }

        setRequests(response.requests)

        if (response.requests.length > 0) {
          const nextRequestId = response.requests[0].id
          setSelectedRequestId(nextRequestId)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load requests.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadRequests()
  }, [])

  useEffect(() => {
    if (!selectedRequestId) {
      setBids([])
      setRequestStatus('')
      setRequestLocation('')
      return
    }

    const loadBidList = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getRequestBids(selectedRequestId)

        if (!response.success) {
          throw new Error(response.message || 'Unable to load bids.')
        }

        setBids(response.bids)
        setRequestStatus(response.request.status)
        setRequestLocation(response.request.location)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load bids.')
      } finally {
        setLoading(false)
      }
    }

    void loadBidList()
  }, [selectedRequestId])

  const totalBids = useMemo(() => bids.length, [bids])

  return (
    <DashboardShell role="BUYER">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">
              Procurement
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">Bids</h1>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-32 rounded bg-[var(--text-primary)]/10" />
              <div className="h-8 w-2/3 rounded bg-[var(--text-primary)]/10" />
              <div className="h-4 w-1/2 rounded bg-[var(--text-primary)]/10" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-sm font-semibold text-red-500">
              Unable to load bids
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Request context
                  </p>

                  {requests.length > 0 ? (
                    <select
                      value={selectedRequestId}
                      onChange={(event) =>
                        setSelectedRequestId(event.target.value)
                      }
                      className="mt-3 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--copper)]/50 md:max-w-md"
                    >
                      {requests.map((request) => (
                        <option key={request.id} value={request.id}>
                          {request.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">
                      No requests available
                    </h2>
                  )}
                </div>

                {requests.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-2.5 py-1.5">
                      {requestStatus || 'N/A'}
                    </span>

                    {requestLocation && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-2.5 py-1.5">
                        <MapPin size={12} />
                        {requestLocation}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>

            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--copper)]">
                  <FileText size={20} />
                </div>

                <h3 className="mt-5 text-lg font-semibold">No requests yet</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Create a request first, then supplier bids will appear here.
                </p>
              </div>
            ) : totalBids === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--copper)]">
                  <FileText size={20} />
                </div>

                <h3 className="mt-5 text-lg font-semibold">No bids yet</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Supplier proposals will appear here once bids are submitted
                  for this request.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {bids.map((bid) => {
                  const latestVersion = bid.latestVersion

                  return (
                    <article
                      key={bid.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building2
                              size={15}
                              className="text-[var(--copper)]"
                            />
                            <h3 className="text-lg font-semibold tracking-[-0.02em]">
                              {bid.supplier.companyName}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-2 py-1">
                              {bid.status}
                            </span>

                            {bid.supplier.verifiedByAdmin && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 text-cyan-500">
                                <ShieldCheck size={10} />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/dashboard/requests/${selectedRequestId}/bids/${bid.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-[11px] font-semibold text-[var(--text-primary)] transition hover:border-[var(--copper)]/50"
                        >
                          View bid
                          <ArrowRight size={14} />
                        </Link>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-3">
                          <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            Price
                          </p>
                          <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                            {latestVersion
                              ? formatCurrency(latestVersion.totalPrice)
                              : 'Not specified'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-3">
                          <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            Capacity
                          </p>
                          <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                            {latestVersion
                              ? `${formatCurrency(latestVersion.panelCapacityKw)} kW`
                              : 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
                        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                          <span>Service area</span>
                          <span className="text-[var(--text-primary)]">
                            {bid.supplier.serviceAreas.length > 0
                              ? bid.supplier.serviceAreas.join(', ')
                              : 'Not specified'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                          <span>Battery</span>
                          <span className="text-[var(--text-primary)]">
                            {latestVersion?.batteryCapacityKwh
                              ? `${formatCurrency(latestVersion.batteryCapacityKwh)} kWh`
                              : 'Not specified'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                          <span>Warranty</span>
                          <span className="text-[var(--text-primary)]">
                            {latestVersion?.warrantyYears
                              ? `${latestVersion.warrantyYears} years`
                              : 'Not specified'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span>Submitted</span>
                          <span className="text-[var(--text-primary)]">
                            {formatDate(bid.createdAt)}
                          </span>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}

export default BidsPage

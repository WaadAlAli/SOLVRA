import { useEffect, useState } from 'react'
import { ArrowLeft, MapPin, Sparkles } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import {
  getSupplierBidById,
  type SupplierBid,
} from '../../../services/supplier.service'

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return 'Not specified'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function SupplierBidDetailPage() {
  const navigate = useNavigate()
  const { bidId } = useParams<{ bidId: string }>()

  const [bid, setBid] = useState<SupplierBid | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!bidId) {
      setError('Bid not found.')
      setLoading(false)
      return
    }

    const loadBid = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getSupplierBidById(bidId)
        setBid(response.bid)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load bid details.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadBid()
  }, [bidId])

  return (
    <DashboardShell role="SUPPLIER">
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/supplier/bids')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={15} />
          Back to bids
        </button>

        {loading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-sm text-[var(--text-secondary)]">
            Loading bid details...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && bid && (
          <>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--copper)]">
                    {bid.status}
                  </p>

                  <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
                    {bid.title || 'Proposal'}
                  </h1>

                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {bid.request.title}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <MapPin
                      size={15}
                      className="text-[var(--copper)]"
                    />
                    {bid.request.location}
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-right">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Total price
                    </p>

                    <p className="mt-1 text-xl font-semibold">
                      {formatValue(bid.latestVersion?.totalPrice)}
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                      Version {bid.latestVersion?.versionNumber ?? 1}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border)] pt-5">
                <Link
                  to={`/supplier/bids/${bid.id}/version`}
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--copper)] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--copper-hover)]"
                >
                  Submit new version
                </Link>

                <Link
                  to={`/supplier/requests/${bid.request.id}/bid`}
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-semibold transition hover:bg-[var(--text-primary)]/[0.04]"
                >
                  Submit another proposal
                </Link>
              </div>
            </section>

            {bid.latestVersion && (
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                  label="Panel capacity"
                  value={formatValue(
                    bid.latestVersion.panelCapacityKw,
                  )}
                />

                <InfoCard
                  label="Battery capacity"
                  value={formatValue(
                    bid.latestVersion.batteryCapacityKwh,
                  )}
                />

                <InfoCard
                  label="Warranty"
                  value={formatValue(
                    bid.latestVersion.warrantyYears,
                  )}
                />

                <InfoCard
                  label="Delivery"
                  value={formatValue(
                    bid.latestVersion.deliveryTimeDays,
                  )}
                />
              </section>
            )}

            {bid.latestVersion && (
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <div className="flex items-center gap-3">
                  <Sparkles
                    size={16}
                    className="text-[var(--copper)]"
                  />

                  <h2 className="text-lg font-semibold">
                    Proposal details
                  </h2>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DetailRow
                    label="Installation cost"
                    value={formatValue(
                      bid.latestVersion.installationCost,
                    )}
                  />

                  <DetailRow
                    label="Delivery cost"
                    value={formatValue(
                      bid.latestVersion.deliveryCost,
                    )}
                  />

                  <DetailRow
                    label="Commissioning cost"
                    value={formatValue(
                      bid.latestVersion.commissioningCost,
                    )}
                  />

                  <DetailRow
                    label="Maintenance cost"
                    value={formatValue(
                      bid.latestVersion.maintenanceCost,
                    )}
                  />

                  <DetailRow
                    label="Payment terms"
                    value={formatValue(
                      bid.latestVersion.paymentTerms,
                    )}
                  />

                  <DetailRow
                    label="Battery type"
                    value={formatValue(
                      bid.latestVersion.batteryType,
                    )}
                  />

                  <DetailRow
                    label="Inverter spec"
                    value={formatValue(
                      bid.latestVersion.inverterSpec,
                    )}
                  />

                  <DetailRow
                    label="Change summary"
                    value={formatValue(
                      bid.latestVersion.changeSummary,
                    )}
                  />
                </div>
              </section>
            )}

            {bid.versions && bid.versions.length > 0 && (
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--copper)]">
                    Bid history
                  </p>

                  <h2 className="mt-2 text-lg font-semibold">
                    Proposal versions
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  {bid.versions.map((version) => {
                    const isLatest =
                      version.id === bid.latestVersion?.id

                    return (
                      <div
                        key={version.id}
                        className={`rounded-xl border p-4 ${
                          isLatest
                            ? 'border-[var(--copper)]/40 bg-[var(--copper)]/5'
                            : 'border-[var(--border)] bg-[var(--bg-primary)]'
                        }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">
                                Version {version.versionNumber}
                              </p>

                              {isLatest && (
                                <span className="rounded-full border border-[var(--copper)]/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--copper)]">
                                  Current
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              Created {formatDate(version.createdAt)}
                            </p>
                          </div>

                          <p className="text-lg font-semibold">
                            {formatValue(version.totalPrice)}
                          </p>
                        </div>

                        {version.changeSummary && (
                          <p className="mt-3 text-sm text-[var(--text-secondary)]">
                            {version.changeSummary}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}

function InfoCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-3 text-lg font-semibold">
        {value}
      </p>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-3">
      <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  )
}

export default SupplierBidDetailPage


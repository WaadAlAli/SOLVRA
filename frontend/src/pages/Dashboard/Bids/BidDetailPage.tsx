import {
  ArrowLeft,
  BatteryCharging,
  Building2,
  CalendarClock,
  CircleDollarSign,
  FileText,
  MapPin,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import { getRequestBidById, type RequestBid } from '../../../services/bid.service'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return 'Not specified'
  }

  return String(value)
}

function BidDetailPage() {
  const navigate = useNavigate()
  const { requestId, bidId } = useParams<{ requestId: string; bidId: string }>()

  const [bid, setBid] = useState<RequestBid | null>(null)
  const [requestTitle, setRequestTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!requestId || !bidId) {
      setError('Bid details are unavailable.')
      setLoading(false)
      return
    }

    const loadBid = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getRequestBidById(requestId, bidId)

        if (!response.success || !response.bid) {
          throw new Error(response.message || 'Unable to load bid details.')
        }

        setBid(response.bid)
        setRequestTitle(response.request.title)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load bid details.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadBid()
  }, [requestId, bidId])

  return (
    <DashboardShell role="BUYER">
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard/bids')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={15} />
          Back to bids
        </button>

        {loading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-24 rounded bg-[var(--text-primary)]/10" />
              <div className="h-8 w-2/3 rounded bg-[var(--text-primary)]/10" />
              <div className="h-4 w-1/2 rounded bg-[var(--text-primary)]/10" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-sm font-semibold text-red-500">Unable to load bid</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>
          </div>
        )}

        {!loading && bid && (
          <>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {requestTitle}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-[var(--copper)]/20 bg-[var(--copper)]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--copper)]">
                      {bid.status}
                    </span>

                    {bid.supplier.verifiedByAdmin && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-500">
                        <ShieldCheck size={10} />
                        Verified
                      </span>
                    )}
                  </div>

                  <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em]">
                    {bid.supplier.companyName}
                  </h1>

                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <MapPin size={15} />
                    {bid.supplier.serviceAreas.length > 0 ? bid.supplier.serviceAreas.join(', ') : 'Service area not specified'}
                  </div>
                </div>

                <Link
                  to={`/dashboard/compare?requestId=${requestId}`}
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-2.5 text-xs font-semibold transition hover:border-[var(--copper)]/50"
                >
                  Compare bids
                </Link>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Total price"
                value={formatValue(bid.latestVersion?.totalPrice)}
                icon={<CircleDollarSign size={15} />}
              />
              <SummaryCard
                label="System size"
                value={bid.latestVersion?.panelCapacityKw ? `${formatValue(bid.latestVersion.panelCapacityKw)} kW` : 'Not specified'}
                icon={<BatteryCharging size={15} />}
              />
              <SummaryCard
                label="Battery"
                value={bid.latestVersion?.batteryCapacityKwh ? `${formatValue(bid.latestVersion.batteryCapacityKwh)} kWh` : 'Not specified'}
                icon={<BatteryCharging size={15} />}
              />
              <SummaryCard
                label="Warranty"
                value={bid.latestVersion?.warrantyYears ? `${formatValue(bid.latestVersion.warrantyYears)} years` : 'Not specified'}
                icon={<ShieldCheck size={15} />}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <div className="mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  <Building2 size={14} />
                  Supplier details
                </div>

                <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                  <InfoRow label="Company" value={bid.supplier.companyName} />
                  <InfoRow label="Certifications" value={bid.supplier.certifications || 'Not specified'} />
                  <InfoRow label="Service areas" value={bid.supplier.serviceAreas.length > 0 ? bid.supplier.serviceAreas.join(', ') : 'Not specified'} />
                  <InfoRow label="Submitted" value={formatDate(bid.createdAt)} />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <div className="mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  <Wrench size={14} />
                  Technical proposal
                </div>

                <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                  <InfoRow label="Inverter" value={bid.latestVersion?.inverterSpec || 'Not specified'} />
                  <InfoRow label="Battery type" value={bid.latestVersion?.batteryType || 'Not specified'} />
                  <InfoRow label="Installation timeline" value={bid.latestVersion?.deliveryTimeDays ? `${formatValue(bid.latestVersion.deliveryTimeDays)} days` : 'Not specified'} />
                  <InfoRow label="Payment terms" value={bid.latestVersion?.paymentTerms || 'Not specified'} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <div className="mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <CalendarClock size={14} />
                Version history
              </div>

              <div className="space-y-4">
                {bid.versions.map((version) => (
                  <div key={version.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          Version {version.versionNumber}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {formatDate(version.createdAt)}
                        </p>
                      </div>

                      <span className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        {version.extractionSource}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InfoRow label="Total price" value={formatValue(version.totalPrice)} />
                      <InfoRow label="Capacity" value={version.panelCapacityKw ? `${formatValue(version.panelCapacityKw)} kW` : 'Not specified'} />
                      <InfoRow label="Battery capacity" value={version.batteryCapacityKwh ? `${formatValue(version.batteryCapacityKwh)} kWh` : 'Not specified'} />
                      <InfoRow label="Warranty" value={version.warrantyYears ? `${formatValue(version.warrantyYears)} years` : 'Not specified'} />
                    </div>

                    {version.changeSummary && (
                      <p className="mt-4 text-sm text-[var(--text-secondary)]">
                        {version.changeSummary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {bid.versions[0]?.documents.length ? (
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <div className="mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  <FileText size={14} />
                  Documents
                </div>

                <div className="space-y-3">
                  {bid.versions[0].documents.map((document) => (
                    <a
                      key={document.id}
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] transition hover:border-[var(--copper)]/50"
                    >
                      <span>{document.fileType}</span>
                      <span className="text-[var(--text-muted)]">{formatDate(document.uploadedAt)}</span>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </DashboardShell>
  )
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        <span className="text-[var(--copper)]">{icon}</span>
        {label}
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-none last:pb-0">
      <span>{label}</span>
      <span className="text-right text-[var(--text-primary)]">{value}</span>
    </div>
  )
}

export default BidDetailPage

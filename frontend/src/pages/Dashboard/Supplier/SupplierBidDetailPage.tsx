import { useEffect, useState } from 'react'
import { ArrowLeft, MapPin, Sparkles } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import { getSupplierBidById, type SupplierBid } from '../../../services/supplier.service'

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return 'Not specified'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
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
        setError(err instanceof Error ? err.message : 'Unable to load bid details.')
      } finally {
        setLoading(false)
      }
    }

    void loadBid()
  }, [bidId])

  return (
    <DashboardShell role="SUPPLIER">
      <div className="space-y-6">
        <button type="button" onClick={() => navigate('/supplier/bids')} className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]">
          <ArrowLeft size={15} />
          Back to bids
        </button>

        {loading && <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-sm text-[var(--text-secondary)]">Loading bid details...</div>}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-500">{error}</div>
        )}

        {!loading && bid && (
          <>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 sm:p-8">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--copper)]">{bid.status}</p>
                  <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">{bid.request.title}</h1>
                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <MapPin size={15} className="text-[var(--copper)]" />
                    {bid.request.location}
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-right">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Total price</p>
                  <p className="mt-1 text-xl font-semibold">{formatValue(bid.latestVersion?.totalPrice)}</p>
                </div>
              </div>
            </section>

            {bid.latestVersion && (
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoCard label="Panel capacity" value={formatValue(bid.latestVersion.panelCapacityKw)} />
                <InfoCard label="Battery capacity" value={formatValue(bid.latestVersion.batteryCapacityKwh)} />
                <InfoCard label="Warranty" value={formatValue(bid.latestVersion.warrantyYears)} />
                <InfoCard label="Delivery" value={formatValue(bid.latestVersion.deliveryTimeDays)} />
              </section>
            )}

            {bid.latestVersion && (
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <div className="flex items-center gap-3">
                  <Sparkles size={16} className="text-[var(--copper)]" />
                  <h2 className="text-lg font-semibold">Proposal details</h2>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DetailRow label="Installation cost" value={formatValue(bid.latestVersion.installationCost)} />
                  <DetailRow label="Delivery cost" value={formatValue(bid.latestVersion.deliveryCost)} />
                  <DetailRow label="Commissioning cost" value={formatValue(bid.latestVersion.commissioningCost)} />
                  <DetailRow label="Maintenance cost" value={formatValue(bid.latestVersion.maintenanceCost)} />
                  <DetailRow label="Payment terms" value={formatValue(bid.latestVersion.paymentTerms)} />
                  <DetailRow label="Battery type" value={formatValue(bid.latestVersion.batteryType)} />
                  <DetailRow label="Inverter spec" value={formatValue(bid.latestVersion.inverterSpec)} />
                  <DetailRow label="Change summary" value={formatValue(bid.latestVersion.changeSummary)} />
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-3 text-lg font-semibold">{value}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-3">
      <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  )
}

export default SupplierBidDetailPage

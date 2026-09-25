import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import { getSupplierRequestById, submitSupplierBid, type SupplierBidPayload } from '../../../services/supplier.service'

const defaultForm = {
  panelCapacityKw: '',
  batteryCapacityKwh: '',
  batteryType: '',
  inverterSpec: '',
  equipmentDetails: '',
  installationCost: '',
  deliveryCost: '',
  commissioningCost: '',
  maintenanceCost: '',
  warrantyYears: '',
  deliveryTimeDays: '',
  paymentTerms: '',
  totalPrice: '',
  changeSummary: '',
}

function SupplierBidFormPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId: string }>()
  const [requestTitle, setRequestTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    if (!requestId) {
      setError('Request not found.')
      setLoading(false)
      return
    }

    const loadRequest = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await getSupplierRequestById(requestId)
        setRequestTitle(response.request.title)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load request.')
      } finally {
        setLoading(false)
      }
    }

    void loadRequest()
  }, [requestId])

  const updateField = (field: keyof typeof defaultForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!requestId) {
      setError('Request not found.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const payload: SupplierBidPayload = {
        panelCapacityKw: Number(form.panelCapacityKw),
        batteryCapacityKwh: form.batteryCapacityKwh ? Number(form.batteryCapacityKwh) : null,
        batteryType: form.batteryType || null,
        inverterSpec: form.inverterSpec || null,
        equipmentDetails: form.equipmentDetails ? JSON.parse(form.equipmentDetails) : null,
        installationCost: Number(form.installationCost),
        deliveryCost: Number(form.deliveryCost),
        commissioningCost: Number(form.commissioningCost),
        maintenanceCost: form.maintenanceCost ? Number(form.maintenanceCost) : null,
        warrantyYears: form.warrantyYears ? Number(form.warrantyYears) : null,
        deliveryTimeDays: form.deliveryTimeDays ? Number(form.deliveryTimeDays) : null,
        paymentTerms: form.paymentTerms || null,
        totalPrice: Number(form.totalPrice),
        extractionSource: 'MANUAL_ENTRY',
        extractionConfirmed: true,
        changeSummary: form.changeSummary || null,
      }

      await submitSupplierBid(requestId, payload)
      navigate(`/supplier/bids`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit the bid.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardShell role="SUPPLIER">
      <div className="space-y-6">
        <button type="button" onClick={() => navigate(`/supplier/requests/${requestId}`)} className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]">
          <ArrowLeft size={15} />
          Back to request
        </button>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">Supplier bid</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">Submit proposal for {requestTitle || 'request'}</h1>
        </div>

        {loading && <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-sm text-[var(--text-secondary)]">Loading form...</div>}

        {!loading && error && <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-500">{error}</div>}

        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Panel capacity (kW)</label>
                <input required value={form.panelCapacityKw} onChange={(event) => updateField('panelCapacityKw', event.target.value)} type="number" step="0.001" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Battery capacity (kWh)</label>
                <input value={form.batteryCapacityKwh} onChange={(event) => updateField('batteryCapacityKwh', event.target.value)} type="number" step="0.001" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Battery type</label>
                <input value={form.batteryType} onChange={(event) => updateField('batteryType', event.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Inverter spec</label>
                <input value={form.inverterSpec} onChange={(event) => updateField('inverterSpec', event.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Installation cost</label>
                <input required value={form.installationCost} onChange={(event) => updateField('installationCost', event.target.value)} type="number" step="0.01" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Delivery cost</label>
                <input required value={form.deliveryCost} onChange={(event) => updateField('deliveryCost', event.target.value)} type="number" step="0.01" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Commissioning cost</label>
                <input required value={form.commissioningCost} onChange={(event) => updateField('commissioningCost', event.target.value)} type="number" step="0.01" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Maintenance cost</label>
                <input value={form.maintenanceCost} onChange={(event) => updateField('maintenanceCost', event.target.value)} type="number" step="0.01" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Warranty years</label>
                <input value={form.warrantyYears} onChange={(event) => updateField('warrantyYears', event.target.value)} type="number" min="0" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Delivery time (days)</label>
                <input value={form.deliveryTimeDays} onChange={(event) => updateField('deliveryTimeDays', event.target.value)} type="number" min="0" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Equipment details (JSON)</label>
                <textarea value={form.equipmentDetails} onChange={(event) => updateField('equipmentDetails', event.target.value)} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm outline-none focus:border-[var(--copper)]" placeholder='{"modules": "Mono", "stringInverter": true}' />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Payment terms</label>
                <input value={form.paymentTerms} onChange={(event) => updateField('paymentTerms', event.target.value)} className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Total price</label>
                <input required value={form.totalPrice} onChange={(event) => updateField('totalPrice', event.target.value)} type="number" step="0.01" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-[var(--copper)]" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Change summary</label>
                <textarea value={form.changeSummary} onChange={(event) => updateField('changeSummary', event.target.value)} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm outline-none focus:border-[var(--copper)]" placeholder="Optional notes for the buyer" />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--copper)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)] disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit bid'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardShell>
  )
}

export default SupplierBidFormPage

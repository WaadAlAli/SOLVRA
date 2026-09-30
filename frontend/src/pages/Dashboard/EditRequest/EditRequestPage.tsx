import { ArrowLeft, Save } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import {
  getRequestById,
  updateRequest,
  type SolarRequest,
} from '../../../services/request.service'

import type {
  PropertyType,
  Currency,
  RoofType,
  PropertyOwnership,
  RequestPriority,
  TargetTimeline,
} from '../../../types/request'

function EditRequestPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()

  const [request, setRequest] = useState<SolarRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [currency, setCurrency] = useState('')
  const [monthlyBill, setMonthlyBill] = useState('')
  const [consumption, setConsumption] = useState('')
  const [roofType, setRoofType] = useState('')
  const [ownership, setOwnership] = useState('')
  const [budget, setBudget] = useState('')
  const [priority, setPriority] = useState('')
  const [timeline, setTimeline] = useState('')

  useEffect(() => {
    const loadRequest = async () => {
      if (!requestId) return

      try {
        setLoading(true)
        setError('')

        const response = await getRequestById(requestId)

        if (!response.success) {
          throw new Error('Unable to load request.')
        }

        const data = response.request
        setRequest(data)

        setTitle(data.title)
        setPropertyType(data.propertyType)
        setLocation(data.location)
        setDescription(data.rawDescription)
        setCurrency(data.currency ?? '')
        setMonthlyBill(data.monthlyElectricityBill?.toString() ?? '')
        setConsumption(data.averageMonthlyConsumption?.toString() ?? '')
        setRoofType(data.roofType ?? '')
        setOwnership(data.ownership ?? '')
        setBudget(data.budget?.toString() ?? '')
        setPriority(data.priority ?? '')
        setTimeline(data.timeline ?? '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load request.')
      } finally {
        setLoading(false)
      }
    }

    void loadRequest()
  }, [requestId])

  const handleSave = async () => {
    if (!requestId) return

    if (
      !title.trim() ||
      !description.trim() ||
      !propertyType ||
      !location.trim()
    ) {
      setError(
        'Please complete the title, description, property type, and location.',
      )
      return
    }

    try {
      setSaving(true)
      setError('')

      await updateRequest(requestId, {
        title: title.trim(),
        propertyType: propertyType as PropertyType,
        location: location.trim(),
        rawDescription: description.trim(),
        ...(currency ? { currency: currency as Currency } : {}),
        ...(monthlyBill ? { monthlyElectricityBill: Number(monthlyBill) } : {}),
        ...(consumption
          ? { averageMonthlyConsumption: Number(consumption) }
          : {}),
        ...(roofType ? { roofType: roofType as RoofType } : {}),
        ...(ownership ? { ownership: ownership as PropertyOwnership } : {}),
        ...(budget ? { budgetMax: Number(budget) } : {}),
        ...(priority
          ? {
              priority: priority as RequestPriority,
            }
          : {}),
        ...(timeline
          ? {
              timeline: timeline as TargetTimeline,
            }
          : {}),
      })

      navigate(`/dashboard/requests/${requestId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell role="BUYER">
        <div className="py-20 text-center text-sm text-[var(--text-muted)]">
          Loading request...
        </div>
      </DashboardShell>
    )
  }

  if (error && !request) {
    return (
      <DashboardShell role="BUYER">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-sm font-semibold text-red-500">
            Unable to load request
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>
          <Link
            to="/dashboard/requests"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft size={14} />
            Back to requests
          </Link>
        </div>
      </DashboardShell>
    )
  }

  if (request?.status !== 'DRAFT') {
    return (
      <DashboardShell role="BUYER">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
          <h1 className="text-lg font-semibold">
            This request cannot be edited
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Only draft requests can be modified.
          </p>
          <Link
            to={`/dashboard/requests/${requestId}`}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold"
          >
            <ArrowLeft size={14} />
            Back to request
          </Link>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="BUYER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            to={`/dashboard/requests/${requestId}`}
            className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            <ArrowLeft size={14} />
            Back to request
          </Link>

          <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">
            Procurement
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
            Edit request
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Update your draft before opening it to suppliers.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Project title" value={title} onChange={setTitle} />

            <Select
              label="Property type"
              value={propertyType}
              onChange={setPropertyType}
              options={[
                ['RESIDENTIAL', 'Residential'],
                ['COMMERCIAL', 'Commercial'],
                ['INSTITUTIONAL', 'Institutional'],
              ]}
            />

            <div className="sm:col-span-2">
              <Field label="Location" value={location} onChange={setLocation} />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Project description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={6}
                className="mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-3 text-sm outline-none transition focus:border-[var(--copper)]/50"
              />
            </div>

            <Field
              label="Monthly electricity bill"
              type="number"
              value={monthlyBill}
              onChange={setMonthlyBill}
            />

            <Field
              label="Average monthly consumption"
              type="number"
              value={consumption}
              onChange={setConsumption}
            />

            <Select
              label="Currency"
              value={currency}
              onChange={setCurrency}
              options={[
                ['USD', 'USD'],
                ['LBP', 'LBP'],
              ]}
            />

            <Select
              label="Roof type"
              value={roofType}
              onChange={setRoofType}
              options={[
                ['FLAT', 'Flat'],
                ['SLOPED', 'Sloped'],
                ['GROUND', 'Ground'],
                ['UNKNOWN', 'Unknown'],
              ]}
            />

            <Select
              label="Ownership"
              value={ownership}
              onChange={setOwnership}
              options={[
                ['OWNED', 'Owned'],
                ['RENTED', 'Rented'],
                ['OTHER', 'Other'],
              ]}
            />

            <Field
              label="Budget"
              type="number"
              value={budget}
              onChange={setBudget}
            />

            <Select
              label="Priority"
              value={priority}
              onChange={setPriority}
              options={[
                ['LOWEST_PRICE', 'Lowest price'],
                ['BALANCED', 'Balanced'],
                ['QUALITY', 'Quality'],
                ['RELIABILITY', 'Reliability'],
              ]}
            />

            <Select
              label="Target timeline"
              value={timeline}
              onChange={setTimeline}
              options={[
                ['ASAP', 'ASAP'],
                ['ONE_TO_THREE_MONTHS', '1–3 months'],
                ['THREE_TO_SIX_MONTHS', '3–6 months'],
                ['SIX_TO_TWELVE_MONTHS', '6–12 months'],
                ['FLEXIBLE', 'Flexible'],
              ]}
            />
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
            <Link
              to={`/dashboard/requests/${requestId}`}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-5 py-2.5 text-xs font-semibold"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--text-primary)] px-5 py-2.5 text-xs font-semibold text-[var(--bg-primary)] transition hover:opacity-90 disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}

function Field({ label, value, onChange, type = 'text' }: FieldProps) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition focus:border-[var(--copper)]/50"
      />
    </div>
  )
}

interface SelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: [string, string][]
}

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm outline-none transition focus:border-[var(--copper)]/50"
      >
        <option value="">Select...</option>

        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  )
}

export default EditRequestPage

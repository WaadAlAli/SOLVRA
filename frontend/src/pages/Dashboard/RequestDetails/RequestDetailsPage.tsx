import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Pencil,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import { getRequestById } from '../../../services/request.service'

interface RequirementProfile {
  occupantsOrUsers: number | null
  acUnitsCount: number | null
  applianceLoad: Record<string, unknown> | null
  usagePattern: Record<string, unknown> | null
  backupRequired: boolean
  currentElectricitySituation: string | null
  goals: string[]
  preferences: string | null
  extractionConfidence: string | number | null
  confirmedByBuyer: boolean
}

interface RequestDetails {
  id: string
  title: string
  propertyType: string
  location: string
  status: string
  budget: string | number | null
  currency: string | null
  rawDescription: string
  monthlyElectricityBill: string | number | null
  averageMonthlyConsumption: string | number | null
  roofType: string | null
  ownership: string | null
  priority: string | null
  timeline: string | null
  createdAt: string
  updatedAt: string
  requirementProfile?: RequirementProfile | null
}

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

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return 'Not specified'
  }

  return String(value)
}

function RequestDetailsPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()

  const [request, setRequest] =
    useState<RequestDetails | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

        const response = await getRequestById(requestId)

        if (!response.success || !response.request) {
          throw new Error(
            response.message || 'Unable to load request.',
          )
        }

        setRequest(
          response.request as unknown as RequestDetails,
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load request.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadRequest()
  }, [requestId])

  return (
    <DashboardShell role="BUYER">
      <div className="space-y-6">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={15} />
          Back to dashboard
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
            <p className="text-sm font-semibold text-red-500">
              Unable to load request
            </p>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {error}
            </p>
          </div>
        )}

        {!loading && request && (
          <>
            {/* Header */}
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-[var(--copper)]/20 bg-[var(--copper)]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--copper)]">
                      {formatStatus(request.status)}
                    </span>

                    <span className="text-[10px] text-[var(--text-muted)]">
                      Created {formatDate(request.createdAt)}
                    </span>
                  </div>

                  <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                    {request.title}
                  </h1>

                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <MapPin size={15} />
                    {request.location}
                  </div>
                </div>

                {request.status === 'DRAFT' && (
                  <Link
                    to={`/dashboard/requests/${request.id}/edit`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-semibold transition hover:bg-[var(--text-primary)]/[0.04]"
                  >
                    <Pencil size={14} />
                    Edit request
                  </Link>
                )}
              </div>
            </section>

            {/* Overview */}
            <section>
              <SectionHeading
                icon={<Zap size={15} />}
                label="Request overview"
              />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard
                  label="Property type"
                  value={formatValue(request.propertyType)}
                />

                <InfoCard
                  label="Roof type"
                  value={formatValue(request.roofType)}
                />

                <InfoCard
                  label="Ownership"
                  value={formatValue(request.ownership)}
                />

                <InfoCard
                  label="Timeline"
                  value={formatValue(request.timeline)}
                />

                <InfoCard
                  label="Monthly bill"
                  value={
                    request.monthlyElectricityBill
                      ? `${formatValue(request.monthlyElectricityBill)} ${request.currency || ''}`
                      : 'Not specified'
                  }
                />

                <InfoCard
                  label="Monthly consumption"
                  value={formatValue(
                    request.averageMonthlyConsumption,
                  )}
                />

                <InfoCard
                  label="Budget"
                  value={
                    request.budget
                      ? `${formatValue(request.budget)} ${request.currency || ''}`
                      : 'Not specified'
                  }
                />

                <InfoCard
                  label="Priority"
                  value={formatValue(request.priority)}
                />
              </div>
            </section>

            {/* Description */}
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Project description
              </p>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
                {request.rawDescription}
              </p>
            </section>

            {/* AI requirements */}
            {request.requirementProfile && (
              <section>
                <SectionHeading
                  icon={<Sparkles size={15} />}
                  label="AI-interpreted requirements"
                  ai
                />

                <div className="rounded-2xl border border-[var(--copper)]/20 bg-[var(--copper)]/[0.035] p-6">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">
                        Confirmed buyer requirements
                      </p>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Information interpreted from your project description.
                      </p>
                    </div>

                    {request.requirementProfile.confirmedByBuyer && (
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500">
                        <CheckCircle2 size={14} />
                        Confirmed
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoCard
                      label="Occupants / users"
                      value={formatValue(
                        request.requirementProfile.occupantsOrUsers,
                      )}
                    />

                    <InfoCard
                      label="AC units"
                      value={formatValue(
                        request.requirementProfile.acUnitsCount,
                      )}
                    />

                    <InfoCard
                      label="Backup required"
                      value={
                        request.requirementProfile.backupRequired
                          ? 'Yes'
                          : 'No'
                      }
                    />

                    <InfoCard
                      label="Current electricity"
                      value={formatValue(
                        request.requirementProfile.currentElectricitySituation,
                      )}
                    />

                    <InfoCard
                      label="Usage pattern"
                      value={
                        request.requirementProfile.usagePattern
                          ? Object.entries(
                              request.requirementProfile.usagePattern,
                            )
                              .map(
                                ([key, value]) =>
                                  `${key}: ${String(value)}`,
                              )
                              .join(', ')
                          : 'Not specified'
                      }
                    />

                    <InfoCard
                      label="AI confidence"
                      value={
                        request.requirementProfile
                          .extractionConfidence
                          ? `${Math.round(
                              Number(
                                request.requirementProfile
                                  .extractionConfidence,
                              ) * 100,
                            )}%`
                          : 'Not available'
                      }
                    />
                  </div>

                  {request.requirementProfile.goals.length > 0 && (
                    <div className="mt-6 border-t border-[var(--border)] pt-5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                        Goals
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {request.requirementProfile.goals.map(
                          (goal) => (
                            <span
                              key={goal}
                              className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-secondary)]"
                            >
                              {goal}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {request.requirementProfile.preferences && (
                    <div className="mt-5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                        Preferences
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {request.requirementProfile.preferences}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Lifecycle */}
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
              <div className="flex items-center gap-3">
                <Clock3
                  size={16}
                  className="text-[var(--copper)]"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Request lifecycle
                  </p>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Your request moves through SOLVRA's procurement workflow.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-5">
                {[
                  'DRAFT',
                  'OPEN',
                  'EVALUATING',
                  'NEGOTIATING',
                  'AWARDED',
                ].map((status) => {
                  const active = status === request.status

                  return (
                    <div
                      key={status}
                      className={`rounded-xl border px-3 py-3 text-center ${
                        active
                          ? 'border-[var(--copper)]/30 bg-[var(--copper)]/10'
                          : 'border-[var(--border)]'
                      }`}
                    >
                      <p
                        className={`text-[9px] font-bold uppercase tracking-[0.1em] ${
                          active
                            ? 'text-[var(--copper)]'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {formatStatus(status)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  )
}

function SectionHeading({
  icon,
  label,
  ai = false,
}: {
  icon: React.ReactNode
  label: string
  ai?: boolean
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
          ai
            ? 'bg-[#00E5FF]/10 text-[#00E5FF]'
            : 'bg-[var(--copper)]/10 text-[var(--copper)]'
        }`}
      >
        {icon}
      </span>

      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
        {label}
      </span>
    </div>
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  )
}

export default RequestDetailsPage
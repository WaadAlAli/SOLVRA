import type { ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import {
  getMyRequests,
  type SolarRequest,
} from '../../../services/request.service'
import {
  getRequestInsights,
  type AiInsightConflict,
  type AiInsightConsideration,
  type AiInsightEntry,
  type AiInsightMissingInfo,
} from '../../../services/ai-insights.service'

function InsightsPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<SolarRequest[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [summary, setSummary] = useState('')
  const [keyDifferences, setKeyDifferences] = useState<AiInsightEntry[]>([])
  const [missingInformation, setMissingInformation] = useState<
    AiInsightMissingInfo[]
  >([])
  const [conflicts, setConflicts] = useState<AiInsightConflict[]>([])
  const [considerations, setConsiderations] = useState<
    AiInsightConsideration[]
  >([])
  const [requiresConfirmation, setRequiresConfirmation] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        setSelectedRequestId(response.requests[0].id)
      } else {
        setSelectedRequestId('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [])

  useEffect(() => {
    if (!selectedRequestId) {
      setSummary('')
      setKeyDifferences([])
      setMissingInformation([])
      setConflicts([])
      setConsiderations([])
      setRequiresConfirmation(true)
      return
    }

    const loadInsights = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getRequestInsights(selectedRequestId)

        if (!response.success) {
          throw new Error(response.message || 'Unable to load AI insights.')
        }

        setSummary(response.insights.summary)
        setKeyDifferences(response.insights.keyDifferences)
        setMissingInformation(response.insights.missingInformation)
        setConflicts(response.insights.conflicts)
        setConsiderations(response.insights.considerations)
        setRequiresConfirmation(response.insights.requiresConfirmation)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load AI insights.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadInsights()
  }, [selectedRequestId])

  return (
    <DashboardShell role="BUYER">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#00E5FF]">
              Intelligence
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
              AI Insights
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard/requests/new')}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)]"
          >
            New request
          </button>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-40 rounded bg-[var(--text-primary)]/10" />
              <div className="h-8 w-2/3 rounded bg-[var(--text-primary)]/10" />
              <div className="h-4 w-1/2 rounded bg-[var(--text-primary)]/10" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-sm font-semibold text-red-500">
              Unable to load AI insights
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>

            <button
              type="button"
              onClick={() => selectedRequestId && void loadRequests()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-500"
            >
              <RefreshCcw size={14} />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full lg:max-w-md">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Select request
                  </p>

                  {requests.length > 0 ? (
                    <select
                      value={selectedRequestId}
                      onChange={(event) =>
                        setSelectedRequestId(event.target.value)
                      }
                      className="mt-3 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[#00E5FF]/50"
                    >
                      {requests.map((request) => (
                        <option key={request.id} value={request.id}>
                          {request.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
                      No solar requests yet.
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#00E5FF]/15 bg-[#00E5FF]/[0.03] px-3 py-2 text-sm text-[var(--text-secondary)]">
                  <span className="font-semibold text-[#00E5FF]">
                    AI INSIGHT
                  </span>{' '}
                  — CONFIRM TO SAVE
                </div>
              </div>
            </section>

            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-primary)] text-[#00E5FF]">
                  <FileText size={20} />
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No solar requests yet.
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Create a request to see AI insights for supplier proposals.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard/requests/new')}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-[var(--text-primary)] px-4 py-2.5 text-xs font-semibold text-[var(--bg-primary)]"
                >
                  Create request
                </button>
              </div>
            ) : (
              <>
                <section className="rounded-2xl border border-[#00E5FF]/15 bg-[var(--bg-secondary)] p-6">
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} className="text-[#00E5FF]" />
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      AI summary
                    </p>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                    {summary || 'No insight summary available yet.'}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    <CheckCircle2 size={14} className="text-[#00E5FF]" />
                    {requiresConfirmation
                      ? 'Requires buyer confirmation'
                      : 'No confirmation required'}
                  </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                  <InsightCard
                    title="Key differences"
                    icon={<Sparkles size={16} className="text-[#00E5FF]" />}
                    items={keyDifferences}
                    emptyMessage="No meaningful differences detected in the available proposals."
                    renderItem={(item) => (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          {item.supplierName || 'Supplier'}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                          {item.insight}
                        </p>
                      </div>
                    )}
                  />

                  <InsightCard
                    title="Missing information"
                    icon={
                      <AlertTriangle
                        size={16}
                        className="text-[var(--copper)]"
                      />
                    }
                    items={missingInformation}
                    emptyMessage="No critical missing information was flagged by the AI."
                    renderItem={(item) => (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          {item.supplierName || 'Supplier'}
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                          {item.item}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                          {item.detail}
                        </p>
                      </div>
                    )}
                  />

                  <InsightCard
                    title="Conflicts or risks"
                    icon={<AlertTriangle size={16} className="text-red-400" />}
                    items={conflicts}
                    emptyMessage="No conflict or risk signals were identified."
                    renderItem={(item) => (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          {item.supplierName || 'Supplier'}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                          {item.issue}
                        </p>
                      </div>
                    )}
                  />

                  <InsightCard
                    title="Buyer considerations"
                    icon={
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    }
                    items={considerations}
                    emptyMessage="No additional buyer considerations were flagged."
                    renderItem={(item) => (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          {item.supplierName || 'Supplier'}
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                          {item.item}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                          {item.detail}
                        </p>
                      </div>
                    )}
                  />
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ArrowLeft size={15} className="text-[var(--text-muted)]" />
                    <span>Buyer-safe workflow</span>
                  </div>

                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                    <li>• AI explains differences and risk signals only.</li>
                    <li>
                      • AI does not rank suppliers, award contracts, or change
                      bid data.
                    </li>
                    <li>
                      • The buyer confirms any saved insight before it becomes a
                      project action.
                    </li>
                  </ul>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}

function InsightCard<T>({
  title,
  icon,
  items,
  emptyMessage,
  renderItem,
}: {
  title: string
  icon: ReactNode
  items: T[]
  emptyMessage: string
  renderItem: (item: T) => ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
      </div>

      <div className="mt-4 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {emptyMessage}
          </p>
        ) : (
          items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4"
            >
              {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default InsightsPage

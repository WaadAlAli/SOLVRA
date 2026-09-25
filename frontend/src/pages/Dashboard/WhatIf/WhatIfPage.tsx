import {
  AlertTriangle,
  ArrowRight,
  Gauge,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import { getMyRequests, type SolarRequest } from '../../../services/request.service'
import { runWhatIfScenario, type WhatIfResponse } from '../../../services/what-if.service'

function formatCurrency(value: number | null, currency: string | null) {
  if (value === null) {
    return '—'
  }

  return `${value.toLocaleString()}${currency ? ` ${currency}` : ''}`
}

function formatValue(value: number | null | string | boolean) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return String(value)
}

function WhatIfPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<SolarRequest[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [budget, setBudget] = useState<number | ''>('')
  const [batteryRequirementKwh, setBatteryRequirementKwh] = useState<number | ''>('')
  const [systemCapacityKw, setSystemCapacityKw] = useState<number | ''>('')
  const [priority, setPriority] = useState<'LOWEST_PRICE' | 'BALANCED' | 'QUALITY' | 'RELIABILITY' | ''>('')
  const [result, setResult] = useState<WhatIfResponse['result'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
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

      if (response.requests.length > 0 && !selectedRequestId) {
        setSelectedRequestId(response.requests[0].id)
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
      setResult(null)
      setBudget('')
      setBatteryRequirementKwh('')
      setSystemCapacityKw('')
      setPriority('')
      return
    }

    const request = requests.find((item) => item.id === selectedRequestId)
    if (!request) {
      return
    }

    setBudget(typeof request.budget === 'number' ? request.budget : Number(request.budget ?? 0) || '')
    setPriority(request.priority as 'LOWEST_PRICE' | 'BALANCED' | 'QUALITY' | 'RELIABILITY' | '')
  }, [selectedRequestId, requests])

  const handleRunScenario = async () => {
    if (!selectedRequestId) {
      return
    }

    try {
      setRunning(true)
      setError('')

      const response = await runWhatIfScenario(selectedRequestId, {
        budget: budget === '' ? null : Number(budget),
        batteryRequirementKwh: batteryRequirementKwh === '' ? null : Number(batteryRequirementKwh),
        systemCapacityKw: systemCapacityKw === '' ? null : Number(systemCapacityKw),
        priority: priority === '' ? null : priority,
      })

      if (!response.success) {
        throw new Error(response.message || 'Unable to run scenario.')
      }

      setResult(response.result ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to run scenario.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <DashboardShell role="BUYER">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">
              Scenario planning
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
              What-If
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard/requests')}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)]"
          >
            View requests
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
            <p className="text-sm font-semibold text-red-500">Unable to run What-If scenario</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>

            <button
              type="button"
              onClick={() => void loadRequests()}
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
                      onChange={(event) => setSelectedRequestId(event.target.value)}
                      className="mt-3 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--copper)]/50"
                    >
                      {requests.map((request) => (
                        <option key={request.id} value={request.id}>{request.title}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
                      No solar requests yet.
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.05] px-3 py-2 text-sm font-semibold text-yellow-200">
                  HYPOTHETICAL — NOT SAVED
                </div>
              </div>
            </section>

            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--copper)]">
                  <Gauge size={20} />
                </div>

                <h3 className="mt-5 text-lg font-semibold">No solar requests yet.</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Create a request to explore hypothetical procurement scenarios.
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
              <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
                <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#00E5FF]" />
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">Scenario controls</h2>
                  </div>

                  <div className="mt-5 space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Budget</span>
                      <input
                        type="number"
                        value={budget}
                        onChange={(event) => setBudget(event.target.value === '' ? '' : Number(event.target.value))}
                        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--copper)]/50"
                        placeholder="Enter hypothetical budget"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Battery requirement (kWh)</span>
                      <input
                        type="number"
                        value={batteryRequirementKwh}
                        onChange={(event) => setBatteryRequirementKwh(event.target.value === '' ? '' : Number(event.target.value))}
                        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--copper)]/50"
                        placeholder="Optional battery target"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">System capacity (kW)</span>
                      <input
                        type="number"
                        value={systemCapacityKw}
                        onChange={(event) => setSystemCapacityKw(event.target.value === '' ? '' : Number(event.target.value))}
                        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--copper)]/50"
                        placeholder="Optional capacity target"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Priority</span>
                      <select
                        value={priority}
                        onChange={(event) => setPriority(event.target.value as 'LOWEST_PRICE' | 'BALANCED' | 'QUALITY' | 'RELIABILITY' | '')}
                        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--copper)]/50"
                      >
                        <option value="">Use current priority</option>
                        <option value="LOWEST_PRICE">Lowest price</option>
                        <option value="BALANCED">Balanced</option>
                        <option value="QUALITY">Quality</option>
                        <option value="RELIABILITY">Reliability</option>
                      </select>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleRunScenario()}
                    disabled={running}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--copper)] px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ArrowRight size={14} />
                    {running ? 'Running scenario...' : 'Run hypothetical scenario'}
                  </button>
                </section>

                <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                  {!result ? (
                    <div className="flex min-h-[280px] items-center justify-center text-center text-[var(--text-secondary)]">
                      Choose a scenario and run it to view hypothetical effects.
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                        <AlertTriangle size={16} className="text-yellow-300" />
                        HYPOTHETICAL — NOT SAVED
                      </div>

                      <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                        {result.summary}
                      </p>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <MetricCard label="Current budget" value={formatCurrency(result.request.currentBudget, null)} />
                        <MetricCard label="Hypothetical budget" value={formatCurrency(result.request.hypotheticalBudget, null)} />
                        <MetricCard label="Current priority" value={formatValue(result.request.currentPriority)} />
                        <MetricCard label="Hypothetical priority" value={formatValue(result.request.hypotheticalPriority)} />
                        <MetricCard label="Battery target" value={formatValue(result.request.hypotheticalBatteryRequirement)} />
                        <MetricCard label="Capacity target" value={formatValue(result.request.hypotheticalSystemCapacityKw)} />
                      </div>

                      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          Feasibility
                        </p>

                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <MetricCard label="Total proposals" value={String(result.feasibility.totalProposals)} />
                          <MetricCard label="Feasible" value={String(result.feasibility.feasibleProposals)} />
                          <MetricCard label="Budget delta" value={formatCurrency(result.feasibility.budgetDelta, null)} />
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">Affected proposals</p>
                          <div className="mt-3 space-y-3">
                            {result.affectedProposals.length === 0 ? (
                              <p className="text-sm text-[var(--text-secondary)]">No proposals were available for this scenario.</p>
                            ) : (
                              result.affectedProposals.map((proposal) => (
                                <div key={proposal.bidId} className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{proposal.supplierName}</p>
                                    <span className={`rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.08em] ${proposal.requirementFit ? 'border-emerald-500/30 text-emerald-300' : 'border-red-500/30 text-red-300'}`}>
                                      {proposal.requirementFit ? 'Fits scenario' : 'Does not fit'}
                                    </span>
                                  </div>

                                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    <MetricCard label="Current price" value={formatCurrency(proposal.currentPrice, null)} />
                                    <MetricCard label="Budget feasible" value={formatValue(proposal.budgetFeasible)} />
                                    <MetricCard label="Current capacity" value={formatValue(proposal.currentCapacity)} />
                                    <MetricCard label="Capacity fit" value={formatValue(proposal.capacityFit)} />
                                    <MetricCard label="Current battery" value={formatValue(proposal.currentBattery)} />
                                    <MetricCard label="Battery fit" value={formatValue(proposal.batteryFit)} />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {result.warnings.length > 0 && (
                          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] p-4">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-yellow-300">Warnings</p>
                            <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                              {result.warnings.map((warning) => (
                                <li key={warning}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
      <p className="text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  )
}

export default WhatIfPage

import { useEffect, useMemo, useState } from 'react'
import  DashboardShell  from '../../../components/dashboard/DashboardShell'
import {
  getMyRequests,
  type SolarRequest,
} from '../../../services/request.service'
import {
  getRequestComparison,
  type ComparisonBid,
} from '../../../services/compare.service'
import {
  getEvaluation,
  runEvaluation,
  setEvaluationCriteria,
  type EvaluationResult,
} from '../../../services/evaluation.service'
import { awardBid } from '../../../services/award.service'

type CriterionName =
  | 'PRICE'
  | 'TECHNICAL_COMPLIANCE'
  | 'WARRANTY'
  | 'DELIVERY'
  | 'MAINTENANCE'
  | 'PAYMENT_TERMS'
  | 'CUSTOM'

interface CriterionState {
  name: CriterionName
  label: string
  weightPercent: number
}

const DEFAULT_CRITERIA: CriterionState[] = [
  { name: 'PRICE', label: 'Price / TCO', weightPercent: 40 },
  {
    name: 'TECHNICAL_COMPLIANCE',
    label: 'Technical Compliance',
    weightPercent: 25,
  },
  { name: 'WARRANTY', label: 'Warranty', weightPercent: 15 },
  { name: 'DELIVERY', label: 'Delivery Time', weightPercent: 10 },
  { name: 'MAINTENANCE', label: 'Maintenance Cost', weightPercent: 10 },
]

const CRITERION_OPTIONS: {
  name: CriterionName
  label: string
}[] = [
  { name: 'PRICE', label: 'Price / TCO' },
  {
    name: 'TECHNICAL_COMPLIANCE',
    label: 'Technical Compliance',
  },
  { name: 'WARRANTY', label: 'Warranty' },
  { name: 'DELIVERY', label: 'Delivery Time' },
  { name: 'MAINTENANCE', label: 'Maintenance Cost' },
  { name: 'PAYMENT_TERMS', label: 'Payment Terms' },
  { name: 'CUSTOM', label: 'Custom' },
]

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const number = Number(value)

  if (Number.isNaN(number)) {
    return String(value)
  }

  return number.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })
}

function getSupplierName(result: EvaluationResult) {
  return (
    result.bidVersion?.bid?.supplier?.companyName ??
    'Supplier'
  )
}

function getCriterionScore(
  result: EvaluationResult,
  criterion: string,
) {
  const score = result.criterionScores?.[criterion]

  if (score === undefined || score === null) {
    return '—'
  }

  return `${Number(score).toFixed(1)}`
}

export default function ComparePage() {
  const [requests, setRequests] = useState<SolarRequest[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState('')

  const [bids, setBids] = useState<ComparisonBid[]>([])
  const [requestTitle, setRequestTitle] = useState('')
  const [requestStatus, setRequestStatus] = useState('')

  const [criteria, setCriteria] =
    useState<CriterionState[]>(DEFAULT_CRITERIA)

  const [evaluationResults, setEvaluationResults] = useState<
    EvaluationResult[]
  >([])

  const [loadingRequests, setLoadingRequests] = useState(true)
  const [loadingComparison, setLoadingComparison] = useState(false)
  const [loadingEvaluation, setLoadingEvaluation] = useState(false)
  const [loadingAward, setLoadingAward] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const totalWeight = useMemo(
    () =>
      criteria.reduce(
        (sum, criterion) => sum + Number(criterion.weightPercent || 0),
        0,
      ),
    [criteria],
  )

  const isWeightValid = totalWeight === 100

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    if (!selectedRequestId) {
      return
    }

    loadComparison(selectedRequestId)
  }, [selectedRequestId])

  async function loadRequests() {
    try {
      setLoadingRequests(true)
      setError('')

      const response = await getMyRequests()

      setRequests(response.requests ?? [])

      if (response.requests?.length > 0) {
        setSelectedRequestId(response.requests[0].id)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load your requests.')
    } finally {
      setLoadingRequests(false)
    }
  }

  async function loadComparison(requestId: string) {
    try {
      setLoadingComparison(true)
      setError('')
      setSuccessMessage('')

      const response = await getRequestComparison(requestId)

      setBids(response.bids ?? [])
      setRequestTitle(response.request.title)
      setRequestStatus(response.request.status)

      // Try to load an existing evaluation.
      try {
        const evaluation = await getEvaluation(requestId)

        setEvaluationResults(evaluation.results ?? [])

        if (evaluation.results?.length > 0) {
          const firstScores =
            evaluation.results[0].criterionScores ?? {}

          const savedCriteria = DEFAULT_CRITERIA.map((criterion) => ({
            ...criterion,
            weightPercent:
              criterion.name === 'PRICE'
                ? 40
                : criterion.name === 'TECHNICAL_COMPLIANCE'
                  ? 25
                  : criterion.name === 'WARRANTY'
                    ? 15
                    : criterion.name === 'DELIVERY'
                      ? 10
                      : firstScores[criterion.name] !== undefined
                        ? criterion.weightPercent
                        : criterion.weightPercent,
          }))

          setCriteria(savedCriteria)
        }
      } catch {
        // No evaluation yet. That's normal for a new request.
        setEvaluationResults([])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load comparison data.')
      setBids([])
      setEvaluationResults([])
    } finally {
      setLoadingComparison(false)
    }
  }

  function updateWeight(
    criterionName: CriterionName,
    value: string,
  ) {
    const parsed = Number(value)

    setCriteria((current) =>
      current.map((criterion) =>
        criterion.name === criterionName
          ? {
              ...criterion,
              weightPercent: Number.isNaN(parsed) ? 0 : parsed,
            }
          : criterion,
      ),
    )
  }

  function addCriterion() {
    const available = CRITERION_OPTIONS.find(
      (option) =>
        !criteria.some((criterion) => criterion.name === option.name),
    )

    if (!available) {
      return
    }

    setCriteria((current) => [
      ...current,
      {
        name: available.name,
        label: available.label,
        weightPercent: 0,
      },
    ])
  }

  function removeCriterion(criterionName: CriterionName) {
    setCriteria((current) =>
      current.filter((criterion) => criterion.name !== criterionName),
    )
  }

  async function handleRunEvaluation() {
    if (!selectedRequestId) {
      return
    }

    if (!isWeightValid) {
      setError(
        `Evaluation weights must total exactly 100%. Current total: ${totalWeight}%.`,
      )
      return
    }

    if (bids.length === 0) {
      setError('There are no supplier bids to evaluate.')
      return
    }

    try {
      setLoadingEvaluation(true)
      setError('')
      setSuccessMessage('')

      await setEvaluationCriteria(
        selectedRequestId,
        criteria.map((criterion) => ({
          name: criterion.name,
          weightPercent: criterion.weightPercent,
        })),
      )

      const response = await runEvaluation(selectedRequestId)

      setEvaluationResults(response.results ?? [])
      setRequestStatus('EVALUATING')

      setSuccessMessage(
        'Evaluation completed successfully. Supplier proposals have been scored.',
      )
    } catch (err) {
      console.error(err)
      setError(
        'Failed to run evaluation. Please check the criteria and try again.',
      )
    } finally {
      setLoadingEvaluation(false)
    }
  }

  async function handleAward(result: EvaluationResult) {
    if (!selectedRequestId) {
      return
    }

    if (!result.bidVersionId) {
      setError('This supplier proposal cannot be awarded.')
      return
    }

    const supplierName = getSupplierName(result)

    const confirmed = window.confirm(
      `Award this request to ${supplierName}? This will mark the request as AWARDED.`,
    )

    if (!confirmed) {
      return
    }

    try {
      setLoadingAward(result.bidVersionId)
      setError('')
      setSuccessMessage('')

      await awardBid(selectedRequestId, result.bidVersionId)

      setRequestStatus('AWARDED')

      setSuccessMessage(
        `Request awarded to ${supplierName} successfully.`,
      )

      await loadComparison(selectedRequestId)
    } catch (err) {
      console.error(err)
      setError(
        'Failed to award this supplier. The request may already have an award.',
      )
    } finally {
      setLoadingAward(null)
    }
  }

  if (loadingRequests) {
    return (
      <DashboardShell role="BUYER">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading your requests...
          </p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="BUYER">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-600">
            Decision Intelligence
          </p>

          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Compare Supplier Proposals
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Compare proposals, define your priorities, and let the
                evaluation engine calculate a transparent score.
              </p>
            </div>

            <div className="w-full md:w-80">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Select request
              </label>

              <select
                value={selectedRequestId}
                onChange={(event) =>
                  setSelectedRequestId(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                {requests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {loadingComparison ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <p className="text-sm text-slate-500">
              Loading supplier proposals...
            </p>
          </div>
        ) : (
          <>
            {/* Request summary */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Current request
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    {requestTitle || 'Solar Request'}
                  </h2>
                </div>

                <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {requestStatus || 'OPEN'}
                </span>
              </div>
            </section>

            {/* Existing comparison */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Proposal Comparison
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Side-by-side proposal data from the latest supplier
                  submissions.
                </p>
              </div>

              {bids.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-slate-500">
                    No supplier proposals are available yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[1000px] w-full text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-500">
                          Criteria
                        </th>

                        {bids.map((bid) => (
                          <th
                            key={bid.id}
                            className="px-6 py-4 font-semibold text-slate-900"
                          >
                            {bid.supplier.companyName}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      <ComparisonRow
                        label="Price"
                        bids={bids}
                        render={(bid) =>
                          bid.totalPrice !== null
                            ? `${formatNumber(bid.totalPrice)} ${bid.currency ?? ''}`
                            : '—'
                        }
                      />

                      <ComparisonRow
                        label="System capacity"
                        bids={bids}
                        render={(bid) =>
                          bid.systemCapacity !== null
                            ? `${formatNumber(bid.systemCapacity)} kW`
                            : '—'
                        }
                      />

                      <ComparisonRow
                        label="Battery"
                        bids={bids}
                        render={(bid) =>
                          bid.batteryStorageKwh !== null
                            ? `${formatNumber(bid.batteryStorageKwh)} kWh`
                            : '—'
                        }
                      />

                      <ComparisonRow
                        label="Inverter"
                        bids={bids}
                        render={(bid) => bid.inverter ?? '—'}
                      />

                      <ComparisonRow
                        label="Warranty"
                        bids={bids}
                        render={(bid) =>
                          bid.warrantyYears !== null
                            ? `${formatNumber(bid.warrantyYears)} years`
                            : '—'
                        }
                      />

                      <ComparisonRow
                        label="Estimated production"
                        bids={bids}
                        render={(bid) =>
                          bid.estimatedAnnualProduction !== null
                            ? `${formatNumber(
                                bid.estimatedAnnualProduction,
                              )} kWh/year`
                            : '—'
                        }
                      />

                      <ComparisonRow
                        label="Installation timeline"
                        bids={bids}
                        render={(bid) =>
                          bid.installationTimelineDays !== null
                            ? `${formatNumber(
                                bid.installationTimelineDays,
                              )} days`
                            : '—'
                        }
                      />

                      <ComparisonRow
                        label="Payment terms"
                        bids={bids}
                        render={(bid) => bid.paymentTerms ?? '—'}
                      />

                      <ComparisonRow
                        label="Supplier notes"
                        bids={bids}
                        render={(bid) => bid.supplierNotes ?? '—'}
                      />

                      <ComparisonRow
                        label="Missing information"
                        bids={bids}
                        render={(bid) =>
                          bid.missingInformation?.length
                            ? bid.missingInformation.join(', ')
                            : 'None'
                        }
                      />
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Evaluation criteria */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">
                      Step 1
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      Set Evaluation Priorities
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Adjust how much each factor matters to your decision.
                    </p>
                  </div>

                  <div
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      isWeightValid
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    Total: {totalWeight}%
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                {criteria.map((criterion) => (
                  <div
                    key={criterion.name}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {criterion.label}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {criterion.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={criterion.weightPercent}
                        onChange={(event) =>
                          updateWeight(
                            criterion.name,
                            event.target.value,
                          )
                        }
                        className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-right text-sm font-semibold text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                      />

                      <span className="text-sm text-slate-500">%</span>

                      {criteria.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeCriterion(criterion.name)
                          }
                          className="rounded-lg px-2 py-2 text-xs font-medium text-slate-400 hover:bg-white hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {criteria.length < CRITERION_OPTIONS.length && (
                  <button
                    type="button"
                    onClick={addCriterion}
                    className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    + Add evaluation criterion
                  </button>
                )}

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-xs leading-5 text-slate-500">
                    SOLVRA uses these weights with deterministic backend
                    scoring. The AI can explain results, but the backend
                    calculates the actual ranking.
                  </p>

                  <button
                    type="button"
                    onClick={handleRunEvaluation}
                    disabled={
                      loadingEvaluation ||
                      !isWeightValid ||
                      bids.length === 0
                    }
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loadingEvaluation
                      ? 'Evaluating...'
                      : 'Run Evaluation'}
                  </button>
                </div>
              </div>
            </section>

            {/* Evaluation results */}
            {evaluationResults.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">
                      Step 2
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      Evaluation Results
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Scores are calculated from your selected priorities.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  {evaluationResults.map((result) => {
                    const awarded =
                      requestStatus === 'AWARDED' &&
                      result.bidVersion?.bid?.status === 'AWARDED'

                    return (
                      <div
                        key={result.id}
                        className={`rounded-2xl border p-5 ${
                          result.rank === 1
                            ? 'border-cyan-200 bg-cyan-50/40'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                                result.rank === 1
                                  ? 'bg-cyan-100 text-cyan-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              #{result.rank}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold text-slate-900">
                                  {getSupplierName(result)}
                                </h3>

                                {result.rank === 1 && (
                                  <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-700">
                                    Top Score
                                  </span>
                                )}

                                {awarded && (
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                                    Awarded
                                  </span>
                                )}
                              </div>

                             <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
  <span>
    TCO:{' '}
    <strong className="text-slate-800">
      {formatNumber(result.tcoAmount)}
    </strong>
  </span>

  <span>
    Score:{' '}
    <strong className="text-slate-800">
      {Number(result.weightedTotalScore).toFixed(2)}
      /100
    </strong>
  </span>



                                <span>
                                  {result.isCompliant
                                    ? 'Compliant'
                                    : 'Non-compliant'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            {requestStatus === 'AWARDED' ? (
                              <button
                                type="button"
                                disabled
                                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500"
                              >
                                {awarded
                                  ? 'Awarded'
                                  : 'Request awarded'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAward(result)}
                                disabled={
                                  loadingAward !== null ||
                                  !result.isCompliant
                                }
                                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {loadingAward === result.bidVersionId
                                  ? 'Awarding...'
                                  : 'Award Supplier'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Score breakdown */}
                        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                          {criteria.map((criterion) => (
                            <div
                              key={criterion.name}
                              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                            >
                              <p className="text-xs font-medium text-slate-500">
                                {criterion.label}
                              </p>

                              <div className="mt-2 flex items-end justify-between gap-2">
                                <span className="text-lg font-semibold text-slate-900">
                                  {getCriterionScore(
                                    result,
                                    criterion.name,
                                  )}
                                </span>

                                <span className="text-xs text-slate-400">
                                  × {criterion.weightPercent}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {!result.isCompliant && (
                          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            This proposal is marked non-compliant by the
                            evaluation engine and cannot be awarded.
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Decision principle */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                SOLVRA Decision Principle
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                The cheapest quote is not automatically the selected
                proposal. SOLVRA evaluates the factors you define,
                calculates the score deterministically, and keeps the
                decision transparent.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}

function ComparisonRow({
  label,
  bids,
  render,
}: {
  label: string
  bids: ComparisonBid[]
  render: (bid: ComparisonBid) => string
}) {
  return (
    <tr>
      <td className="px-6 py-4 font-medium text-slate-600">
        {label}
      </td>

      {bids.map((bid) => (
        <td
          key={bid.id}
          className="px-6 py-4 text-slate-800"
        >
          {render(bid)}
        </td>
      ))}
    </tr>
  )
}
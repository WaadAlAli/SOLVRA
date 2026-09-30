import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import {
  getSupplierRequestById,
  type SupplierRequest,
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

function SupplierRequestDetailPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId: string }>()
  const [request, setRequest] = useState<SupplierRequest | null>(null)
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
        const response = await getSupplierRequestById(requestId)
        setRequest(response.request)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load this request.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadRequest()
  }, [requestId])

  const requirementProfile = useMemo(
    () => request?.requirementProfile ?? null,
    [request],
  )

  return (
    <DashboardShell role="SUPPLIER">
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/supplier/requests')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={15} />
          Back to requests
        </button>

        {loading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-sm text-[var(--text-secondary)]">
            Loading request details...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && request && (
          <>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="rounded-full border border-[var(--copper)]/20 bg-[var(--copper)]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--copper)]">
                    {request.status}
                  </span>
                  <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                    {request.title}
                  </h1>
                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <MapPin size={15} className="text-[var(--copper)]" />
                    {request.location}
                  </div>
                </div>

                <Link
                  to={`/supplier/requests/${request.id}/bid`}
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--copper)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)]"
                >
                  Submit bid
                </Link>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Property type
                </p>
                <p className="mt-3 text-lg font-semibold">
                  {formatValue(request.propertyType)}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Budget
                </p>
                <p className="mt-3 text-lg font-semibold">
                  {formatValue(request.budget)}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Timeline
                </p>
                <p className="mt-3 text-lg font-semibold">
                  {formatValue(request.timeline)}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Priority
                </p>
                <p className="mt-3 text-lg font-semibold">
                  {formatValue(request.priority)}
                </p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <div className="flex items-center gap-3">
                  <Sparkles size={16} className="text-[var(--copper)]" />
                  <h2 className="text-lg font-semibold">Project summary</h2>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
                  {request.rawDescription || 'Buyer description not provided.'}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-[var(--copper)]" />
                  <h2 className="text-lg font-semibold">Requirements</h2>
                </div>
                <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
                  {requirementProfile ? (
                    <>
                      <p>
                        <span className="font-medium text-[var(--text-primary)]">
                          Occupants:
                        </span>{' '}
                        {formatValue(requirementProfile.occupantsOrUsers)}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--text-primary)]">
                          AC units:
                        </span>{' '}
                        {formatValue(requirementProfile.acUnitsCount)}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--text-primary)]">
                          Backup required:
                        </span>{' '}
                        {String(requirementProfile.backupRequired)}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--text-primary)]">
                          Goals:
                        </span>{' '}
                        {Array.isArray(requirementProfile.goals)
                          ? requirementProfile.goals.join(', ')
                          : 'Not specified'}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--text-primary)]">
                          Preferences:
                        </span>{' '}
                        {formatValue(requirementProfile.preferences)}
                      </p>
                    </>
                  ) : (
                    <p>No requirement profile is available yet.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <div className="flex items-center gap-3">
                <CircleDollarSign size={16} className="text-[var(--copper)]" />
                <h2 className="text-lg font-semibold">Bid readiness</h2>
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[var(--copper)]" />{' '}
                  This request is open to supplier proposals.
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  )
}

export default SupplierRequestDetailPage

import {
  AlertCircle,
  Clock3,
  MessageSquareText,
  RefreshCcw,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import {
  getMyNegotiations,
  getNegotiationById,
  sendNegotiationMessage,
  type NegotiationSummary,
  type NegotiationMessage,
} from '../../../services/negotiation.service'

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatCurrency(value: number | null, currency: string | null) {
  if (value === null) {
    return '—'
  }

  return `${value.toLocaleString()}${currency ? ` ${currency}` : ''}`
}

function NegotiationsPage() {
  const navigate = useNavigate()
  const [negotiations, setNegotiations] = useState<NegotiationSummary[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState<NegotiationMessage[]>([])
  const [selectedNegotiation, setSelectedNegotiation] = useState<NegotiationSummary | null>(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const refreshNegotiations = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getMyNegotiations()

      if (!response.success) {
        throw new Error(response.message || 'Unable to load negotiations.')
      }

      setNegotiations(response.negotiations)

      if (response.negotiations.length > 0) {
        if (!selectedId || !response.negotiations.some((item) => item.id === selectedId)) {
          setSelectedId(response.negotiations[0].id)
        }
      } else {
        setSelectedId('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load negotiations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshNegotiations()
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setSelectedNegotiation(null)
      setMessages([])
      return
    }

    const loadDetail = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getNegotiationById(selectedId)

        if (!response.success) {
          throw new Error(response.message || 'Unable to load negotiation details.')
        }

        const detail = response.negotiation
        const summary: NegotiationSummary = {
          id: detail.id,
          status: detail.status,
          createdAt: detail.createdAt,
          request: detail.request,
          supplier: detail.supplier,
          proposal: detail.proposal,
          lastActivityAt: detail.messages.at(-1)?.createdAt ?? detail.createdAt,
          messageCount: detail.messages.length,
        }

        setSelectedNegotiation(summary)
        setMessages(detail.messages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load negotiation details.')
      } finally {
        setLoading(false)
      }
    }

    void loadDetail()
  }, [selectedId])

  const handleSend = async () => {
    if (!selectedId || !draft.trim()) {
      return
    }

    try {
      setSending(true)
      setError('')

      const response = await sendNegotiationMessage(selectedId, { content: draft.trim() })

      if (!response.success) {
        throw new Error(response.message || 'Unable to send message.')
      }

      setDraft('')
      const refreshed = await getNegotiationById(selectedId)

      if (refreshed.success) {
        const detail = refreshed.negotiation
        const summary: NegotiationSummary = {
          id: detail.id,
          status: detail.status,
          createdAt: detail.createdAt,
          request: detail.request,
          supplier: detail.supplier,
          proposal: detail.proposal,
          lastActivityAt: detail.messages.at(-1)?.createdAt ?? detail.createdAt,
          messageCount: detail.messages.length,
        }

        setSelectedNegotiation(summary)
        setMessages(detail.messages)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.')
    } finally {
      setSending(false)
    }
  }

  const selectedMessageCount = useMemo(() => messages.length, [messages])

  return (
    <DashboardShell role="BUYER">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">
              Procurement
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
              Negotiations
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
            <p className="text-sm font-semibold text-red-500">Unable to load negotiations</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>

            <button
              type="button"
              onClick={() => void refreshNegotiations()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-500"
            >
              <RefreshCcw size={14} />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
            <aside className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Negotiation list</p>
                <span className="text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {negotiations.length} total
                </span>
              </div>

              {negotiations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-primary)] p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--copper)]">
                    <MessageSquareText size={18} />
                  </div>

                  <h3 className="mt-4 text-base font-semibold">No negotiations yet</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Start a procurement conversation with a supplier once a proposal is available.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {negotiations.map((negotiation) => (
                    <button
                      key={negotiation.id}
                      type="button"
                      onClick={() => setSelectedId(negotiation.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selectedId === negotiation.id
                          ? 'border-[var(--copper)]/50 bg-[var(--copper)]/[0.05]'
                          : 'border-[var(--border)] bg-[var(--bg-primary)] hover:bg-[var(--text-primary)]/[0.025]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{negotiation.request.title}</p>
                        <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[9px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          {negotiation.status}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-[var(--text-muted)]">{negotiation.supplier.companyName}</p>

                      <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                        <span>{formatCurrency(negotiation.proposal.price, negotiation.proposal.currency)}</span>
                        <span>{negotiation.messageCount} messages</span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        <Clock3 size={12} />
                        {formatDate(negotiation.lastActivityAt)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              {!selectedNegotiation ? (
                <div className="flex min-h-[280px] items-center justify-center text-center text-[var(--text-secondary)]">
                  Select a negotiation to review the conversation.
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          Negotiation workspace
                        </p>
                        <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">{selectedNegotiation.request.title}</h2>
                      </div>

                      <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[9px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        {selectedNegotiation.status}
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <InfoChip label="Supplier" value={selectedNegotiation.supplier.companyName} />
                      <InfoChip label="Proposal" value={formatCurrency(selectedNegotiation.proposal.price, selectedNegotiation.proposal.currency)} />
                      <InfoChip label="Last activity" value={formatDate(selectedNegotiation.lastActivityAt)} />
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      <ShieldCheck size={14} className="text-[var(--copper)]" />
                      Proposal context
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
                        <p className="text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Bid version</p>
                        <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                          {selectedNegotiation.proposal.versionNumber ?? '—'}
                        </p>
                      </div>

                      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
                        <p className="text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Request budget</p>
                        <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                          {formatCurrency(selectedNegotiation.request.budget, selectedNegotiation.request.currency)}
                        </p>
                      </div>

                      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
                        <p className="text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Supplier response count</p>
                        <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{selectedMessageCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {messages.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-primary)] p-6 text-center text-sm text-[var(--text-secondary)]">
                        No messages yet for this negotiation.
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`max-w-[80%] rounded-2xl border p-4 ${
                            message.authorType === 'BUYER'
                              ? 'ml-auto border-[var(--copper)]/30 bg-[var(--copper)]/[0.05]'
                              : 'border-[var(--border)] bg-[var(--bg-primary)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            <span>{message.authorType === 'BUYER' ? 'Buyer' : 'Supplier'}</span>
                            <span>{formatDate(message.createdAt)}</span>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
                            {message.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                    <label className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      Add buyer message
                    </label>

                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      rows={4}
                      placeholder="Describe the pricing, delivery, or technical concern you want to discuss with the supplier."
                      className="mt-3 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--copper)]/50"
                    />

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        <AlertCircle size={12} />
                        Negotiations do not create an award.
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleSend()}
                        disabled={sending || !draft.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--copper)] px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send size={14} />
                        {sending ? 'Sending...' : 'Send message'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
      <p className="text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  )
}

export default NegotiationsPage

import {
  AlertCircle,
  Clock3,
  MessageSquareText,
  RefreshCcw,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DashboardShell from '../../../components/dashboard/DashboardShell'
import { useAuth } from '../../../context/AuthContext'
import {
  getMyNegotiations,
  getNegotiationById,
  sendNegotiationMessage,
  type NegotiationMessage,
  type NegotiationSummary,
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
  const { user } = useAuth()
  const navigate = useNavigate()

  const role = user?.role === 'SUPPLIER' ? 'SUPPLIER' : 'BUYER'
  const isBuyer = role === 'BUYER'

  const [negotiations, setNegotiations] = useState<NegotiationSummary[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedNegotiation, setSelectedNegotiation] =
    useState<NegotiationSummary | null>(null)
  const [messages, setMessages] = useState<NegotiationMessage[]>([])
  const [draft, setDraft] = useState('')

  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const loadNegotiations = useCallback(async () => {
    try {
      setError('')

      const response = await getMyNegotiations()

      if (!response.success) {
        throw new Error(response.message || 'Unable to load negotiations.')
      }

      setNegotiations(response.negotiations)

      if (response.negotiations.length === 0) {
        setSelectedId('')
        return
      }

      setSelectedId((current) => {
        if (
          current &&
          response.negotiations.some((item) => item.id === current)
        ) {
          return current
        }

        return response.negotiations[0].id
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load negotiations.',
      )
    }
  }, [])

  const loadDetail = useCallback(
    async (negotiationId: string, showLoading = false) => {
      try {
        if (showLoading) {
          setDetailLoading(true)
        }

        const response = await getNegotiationById(negotiationId)

        if (!response.success) {
          throw new Error(
            response.message || 'Unable to load negotiation details.',
          )
        }

        const detail = response.negotiation

        const summary: NegotiationSummary = {
          id: detail.id,
          status: detail.status,
          createdAt: detail.createdAt,
          request: detail.request,
          supplier: detail.supplier,
          proposal: detail.proposal,
          lastActivityAt:
            detail.messages.at(-1)?.createdAt ?? detail.createdAt,
          messageCount: detail.messages.length,
        }

        setSelectedNegotiation(summary)
        setMessages(detail.messages)
      } catch (err) {
        if (showLoading) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load negotiation details.',
          )
        }
      } finally {
        if (showLoading) {
          setDetailLoading(false)
        }
      }
    },
    [],
  )

  // Initial list load.
  useEffect(() => {
    const initialize = async () => {
      setLoading(true)
      await loadNegotiations()
      setLoading(false)
    }

    void initialize()
  }, [loadNegotiations])

  // Load the selected negotiation.
  useEffect(() => {
    if (!selectedId) {
      setSelectedNegotiation(null)
      setMessages([])
      return
    }

    void loadDetail(selectedId, true)
  }, [selectedId, loadDetail])

  // Live conversation:
  // refresh the selected negotiation every 2.5 seconds.
  useEffect(() => {
    if (!selectedId) {
      return
    }

    const interval = window.setInterval(() => {
      void loadDetail(selectedId)
    }, 2500)

    return () => {
      window.clearInterval(interval)
    }
  }, [selectedId, loadDetail])

  const handleSend = async () => {
    if (!selectedId || !draft.trim() || sending) {
      return
    }

    try {
      setSending(true)
      setError('')

      const response = await sendNegotiationMessage(selectedId, {
        content: draft.trim(),
      })

      if (!response.success) {
        throw new Error(response.message || 'Unable to send message.')
      }

      setDraft('')

      // Immediately show the newly sent message.
      await loadDetail(selectedId)
      await loadNegotiations()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to send message.',
      )
    } finally {
      setSending(false)
    }
  }

  const handleRetry = async () => {
    setLoading(true)
    setError('')

    await loadNegotiations()

    if (selectedId) {
      await loadDetail(selectedId, true)
    }

    setLoading(false)
  }

  return (
    <DashboardShell role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--copper)]">
              {isBuyer ? 'Procurement' : 'Supplier Workspace'}
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">
              Negotiations
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              {isBuyer
                ? 'Discuss proposal terms directly with suppliers before making your final decision.'
                : 'Respond to buyer questions and discuss the terms of your submitted proposals.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(isBuyer ? '/dashboard/requests' : '/supplier/bids')
            }
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)]"
          >
            {isBuyer ? 'View requests' : 'View my bids'}
          </button>
        </div>

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 text-red-500" size={17} />

              <div>
                <p className="text-sm font-semibold text-red-500">
                  Negotiation error
                </p>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => void handleRetry()}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-xs font-medium text-red-500"
                >
                  <RefreshCcw size={13} />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-40 rounded bg-[var(--text-primary)]/10" />
              <div className="h-8 w-2/3 rounded bg-[var(--text-primary)]/10" />
              <div className="h-4 w-1/2 rounded bg-[var(--text-primary)]/10" />
            </div>
          </div>
        )}

        {/* Main workspace */}
        {!loading && !error && (
          <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            {/* Negotiation list */}
            <aside className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {isBuyer ? 'Supplier conversations' : 'Buyer conversations'}
                  </p>

                  <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                    {isBuyer
                      ? 'Negotiations on your requests'
                      : 'Negotiations on your bids'}
                  </p>
                </div>

                <span className="text-[9px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {negotiations.length} total
                </span>
              </div>

              {negotiations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-primary)] p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--copper)]">
                    <MessageSquareText size={18} />
                  </div>

                  <h3 className="mt-4 text-base font-semibold">
                    No negotiations yet
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {isBuyer
                      ? 'Negotiations will appear here when you discuss a supplier proposal.'
                      : 'Negotiations will appear here when a buyer starts a conversation about one of your bids.'}
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
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                            {negotiation.request.title}
                          </p>

                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            {isBuyer
                              ? negotiation.supplier.companyName
                              : 'Buyer conversation'}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-1 text-[9px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          {negotiation.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                        <span>
                          {formatCurrency(
                            negotiation.proposal.price,
                            negotiation.proposal.currency,
                          )}
                        </span>

                        <span>
                          {negotiation.messageCount}{' '}
                          {negotiation.messageCount === 1
                            ? 'message'
                            : 'messages'}
                        </span>
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

            {/* Conversation */}
            <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
              {!selectedNegotiation ? (
                <div className="flex min-h-[520px] items-center justify-center p-8 text-center">
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--copper)]">
                      <MessageSquareText size={21} />
                    </div>

                    <h3 className="mt-4 text-base font-semibold">
                      Select a negotiation
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
                      Choose a conversation from the list to view the proposal
                      and exchange messages.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Conversation header */}
                  <div className="border-b border-[var(--border)] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          Bid negotiation
                        </p>

                        <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">
                          {selectedNegotiation.request.title}
                        </h2>

                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          {isBuyer
                            ? `Negotiating with ${selectedNegotiation.supplier.companyName}`
                            : 'Negotiating with the buyer'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Live
                        </span>

                        <span className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[9px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          {selectedNegotiation.status}
                        </span>
                      </div>
                    </div>

                    {/* Proposal context */}
                    <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        <ShieldCheck
                          size={14}
                          className="text-[var(--copper)]"
                        />
                        Proposal context
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <InfoChip
                          label={isBuyer ? 'Supplier' : 'Your company'}
                          value={selectedNegotiation.supplier.companyName}
                        />

                        <InfoChip
                          label="Current proposal"
                          value={formatCurrency(
                            selectedNegotiation.proposal.price,
                            selectedNegotiation.proposal.currency,
                          )}
                        />

                        <InfoChip
                          label="Bid version"
                          value={
                            selectedNegotiation.proposal.versionNumber
                              ? `Version ${selectedNegotiation.proposal.versionNumber}`
                              : '—'
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="min-h-[360px] max-h-[520px] space-y-4 overflow-y-auto p-5">
                    {detailLoading && messages.length === 0 ? (
                      <div className="flex h-40 items-center justify-center text-sm text-[var(--text-muted)]">
                        Loading conversation...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex h-40 items-center justify-center text-center">
                        <div>
                          <MessageSquareText
                            size={22}
                            className="mx-auto text-[var(--text-muted)]"
                          />

                          <p className="mt-3 text-sm font-medium">
                            No messages yet
                          </p>

                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Start the negotiation below.
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isMine =
                          message.authorType === role

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isMine ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[78%] rounded-2xl border p-4 ${
                                isMine
                                  ? 'border-[var(--copper)]/30 bg-[var(--copper)]/[0.07]'
                                  : 'border-[var(--border)] bg-[var(--bg-primary)]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4 text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                <span>
                                  {isMine
                                    ? 'You'
                                    : message.authorType === 'BUYER'
                                      ? 'Buyer'
                                      : 'Supplier'}
                                </span>

                                <span>
                                  {formatDate(message.createdAt)}
                                </span>
                              </div>

                              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Composer */}
                  <div className="border-t border-[var(--border)] p-5">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                      <label className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        {isBuyer
                          ? 'Message supplier'
                          : 'Message buyer'}
                      </label>

                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (
                            event.key === 'Enter' &&
                            !event.shiftKey
                          ) {
                            event.preventDefault()
                            void handleSend()
                          }
                        }}
                        rows={3}
                        maxLength={2000}
                        placeholder={
                          isBuyer
                            ? 'Discuss pricing, delivery, warranty, or other proposal terms...'
                            : 'Respond to the buyer about your proposal...'
                        }
                        className="mt-3 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--copper)]/50"
                      />

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                          <AlertCircle size={12} />
                          <span>
                            Enter to send · Shift + Enter for a new line
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleSend()}
                          disabled={sending || !draft.trim()}
                          className="inline-flex items-center gap-2 rounded-xl bg-[var(--copper)] px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Send size={14} />
                          {sending ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-[10px] leading-5 text-[var(--text-muted)]">
                      Negotiation messages discuss the bid. They do not
                      automatically change the submitted proposal or create an
                      award.
                    </p>
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

function InfoChip({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
      <p className="text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-medium text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  )
}

export default NegotiationsPage


import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import type { RequestStep, SolarRequestForm } from '../../../types/request'

import {
  analyzeRequest,
  confirmRequirements,
  createRequest,
  getRequestById,
  openRequest,
  type AnalyzeRequestResult,
} from '../../../services/request.service'

const steps: {
  id: RequestStep
  number: string
  label: string
}[] = [
  { id: 'PROJECT', number: '01', label: 'Project' },
  { id: 'ENERGY', number: '02', label: 'Energy Need' },
  { id: 'SITE', number: '03', label: 'Site' },
  { id: 'PREFERENCES', number: '04', label: 'Preferences' },
  { id: 'REVIEW', number: '05', label: 'Review' },
  { id: 'SUBMIT', number: '06', label: 'Submit' },
]

const initialForm: SolarRequestForm = {
  projectTitle: '',
  projectDescription: '',

  propertyType: '',
  monthlyElectricityBill: '',
  currency: 'USD',
  averageMonthlyConsumption: '',

  location: '',
  roofType: '',
  ownership: '',

  budgetMin: '',
  budgetMax: '',
  priority: '',
  targetTimeline: '',
}

function getApiErrorMessage(err: any, fallback: string) {
  const data = err?.response?.data
  const fieldErrors = data?.errors?.fieldErrors as
    Record<string, string[] | undefined> | undefined

  if (fieldErrors) {
    const details = Object.entries(fieldErrors)
      .map(([field, messages]) => `${field}: ${(messages ?? []).join(', ')}`)
      .join('; ')

    if (details) {
      return `${data?.message ?? fallback} (${details})`
    }
  }

  return data?.message || fallback
}

function CreateSolarRequestPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const draftRequestId =
    (location.state as { draftRequestId?: string } | null)?.draftRequestId ??
    null

  const [currentStep, setCurrentStep] = useState<RequestStep>('PROJECT')

  const [form, setForm] = useState<SolarRequestForm>(initialForm)

  const [requestId, setRequestId] = useState<string | null>(null)

  const [analysis, setAnalysis] = useState<AnalyzeRequestResult | null>(null)

  const [resumingDraftId, setResumingDraftId] = useState<string | null>(null)

  const loadedDraftRef = useRef<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [error, setError] = useState('')

  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  const updateField = <K extends keyof SolarRequestForm>(
    field: K,
    value: SolarRequestForm[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))

    setError('')
  }

  const validateCurrentStep = () => {
    if (currentStep === 'PROJECT') {
      if (!form.projectTitle.trim()) {
        setError('Please enter a project name.')
        return false
      }

      if (!form.projectDescription.trim()) {
        setError('Please describe what you need.')
        return false
      }
    }

    if (currentStep === 'ENERGY') {
      if (!form.propertyType) {
        setError('Please select a property type.')
        return false
      }
    }

    if (currentStep === 'SITE') {
      if (!form.location.trim()) {
        setError('Please enter the installation location.')
        return false
      }
    }

    if (currentStep === 'PREFERENCES') {
      if (!form.priority) {
        setError('Please select your main priority.')
        return false
      }
    }

    return true
  }

  const goNext = async () => {
    if (!validateCurrentStep()) {
      return
    }

    if (currentIndex < steps.length - 1) {
      setError('')

      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const goBack = () => {
    setError('')

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    } else {
      navigate('/dashboard')
    }
  }

  useEffect(() => {
    if (!draftRequestId || loadedDraftRef.current === draftRequestId) {
      return
    }

    loadedDraftRef.current = draftRequestId
    setResumingDraftId(draftRequestId)

    const loadDraftRequest = async () => {
      try {
        setError('')
        setIsSubmitting(true)

        const response = await getRequestById(draftRequestId)

        if (!response.success || !response.request) {
          throw new Error('Unable to load draft request.')
        }

        const request = response.request

        if (request.status !== 'DRAFT') {
          navigate(`/dashboard/requests/${request.id}`, { replace: true })
          return
        }

        setRequestId(request.id)
        setForm({
          projectTitle: request.title,
          projectDescription: request.rawDescription,
          propertyType:
            (request.propertyType as SolarRequestForm['propertyType']) ?? '',
          monthlyElectricityBill: request.monthlyElectricityBill
            ? String(request.monthlyElectricityBill)
            : '',
          currency: (request.currency as SolarRequestForm['currency']) ?? 'USD',
          averageMonthlyConsumption: request.averageMonthlyConsumption
            ? String(request.averageMonthlyConsumption)
            : '',
          location: request.location,
          roofType: (request.roofType as SolarRequestForm['roofType']) ?? '',
          ownership: (request.ownership as SolarRequestForm['ownership']) ?? '',
          budgetMin: '',
          budgetMax: request.budget ? String(request.budget) : '',
          priority: (request.priority as SolarRequestForm['priority']) ?? '',
          targetTimeline:
            (request.timeline as SolarRequestForm['targetTimeline']) ?? '',
        })

        setCurrentStep('SUBMIT')

        const analysisResponse = await analyzeRequest(request.id)
        setAnalysis(analysisResponse.analysis)
      } catch (err: any) {
        setError(
          getApiErrorMessage(
            err,
            'We could not load your draft request. Please try again.',
          ),
        )
      } finally {
        setIsSubmitting(false)
      }
    }

    void loadDraftRequest()
  }, [draftRequestId, navigate])

  const updateAnalysis = <K extends keyof AnalyzeRequestResult>(
    field: K,
    value: AnalyzeRequestResult[K],
  ) => {
    setAnalysis((previous) =>
      previous
        ? {
            ...previous,
            [field]: value,
          }
        : previous,
    )
  }

  const handleSubmit = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      /*
       * If a request already exists (resumed draft, or a retry after a
       * failed analysis), re-analyze it. Never create a second request.
       */
      const existingRequestId = resumingDraftId ?? requestId

      if (existingRequestId) {
        const analysisResponse = await analyzeRequest(existingRequestId)
        setRequestId(existingRequestId)
        setAnalysis(analysisResponse.analysis)
        setCurrentStep('SUBMIT')
        return
      }

      const createResponse = await createRequest({
        title: form.projectTitle.trim(),
        propertyType: form.propertyType as Exclude<
          SolarRequestForm['propertyType'],
          ''
        >,
        location: form.location.trim(),
        rawDescription: form.projectDescription.trim(),

        currency: form.currency || undefined,

        monthlyElectricityBill: form.monthlyElectricityBill
          ? Number(form.monthlyElectricityBill)
          : undefined,

        averageMonthlyConsumption: form.averageMonthlyConsumption
          ? Number(form.averageMonthlyConsumption)
          : undefined,

        roofType: form.roofType || undefined,
        ownership: form.ownership || undefined,

        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,

        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,

        priority: form.priority || undefined,

        timeline: form.targetTimeline || undefined,
      })

      const createdId = createResponse.request.id

      setRequestId(createdId)

      const analysisResponse = await analyzeRequest(createdId)

      setAnalysis(analysisResponse.analysis)
    } catch (err: any) {
      setError(
        getApiErrorMessage(
          err,
          'We could not process your request. Please try again.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmAndOpen = async () => {
    if (!requestId || !analysis) {
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      /*
       * Conflicts must be resolved before confirmation.
       */
      if (analysis.conflicts.length > 0) {
        setError(
          'Please resolve the conflicts identified by SOLVRA before continuing.',
        )

        setIsSubmitting(false)
        return
      }

      /*
       * Save the buyer-confirmed AI interpretation.
       */
      await confirmRequirements(requestId, {
        occupantsOrUsers: analysis.occupantsOrUsers,

        acUnitsCount: analysis.acUnitsCount,

        applianceLoad: analysis.applianceLoad,

        usagePattern: analysis.usagePattern,

        backupRequired: analysis.backupRequired,

        currentElectricitySituation: analysis.currentElectricitySituation,

        goals: analysis.goals.filter((goal) => goal.trim().length > 0),

        preferences: analysis.preferences,

        extractionConfidence: analysis.extractionConfidence,

        missingInformation: analysis.missingInformation,

        conflicts: analysis.conflicts,

        confirmedByBuyer: true,
      })

      /*
       * Open the same existing request for suppliers.
       */
      await openRequest(requestId)

      /*
       * Return to buyer dashboard.
       */
      navigate('/dashboard')
    } catch (err: any) {
      setError(
        getApiErrorMessage(
          err,
          'We could not confirm your requirements. Please try again.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--text-primary)] text-sm font-bold text-[var(--bg-primary)]">
              S
            </div>

            <div className="text-left">
              <div className="text-sm font-semibold tracking-[0.16em]">
                SOLVRA
              </div>

              <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Solar Procurement
              </div>
            </div>
          </button>

          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)]">
              New solar request
            </p>

            <p className="text-sm font-medium">
              {requestId ? 'Processing' : 'Draft'}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:py-12">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--copper)]">
            <Sparkles size={14} />
            Solar Request
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Tell us what you need.
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            Build a structured solar request that suppliers can understand and
            bid on.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-10 overflow-x-auto">
          <div className="flex min-w-[720px] items-center">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = index < currentIndex

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <button
                    type="button"
                    disabled={index > currentIndex}
                    onClick={() => setCurrentStep(step.id)}
                    className="flex items-center gap-3 text-left"
                  >
                    <div
                      className={[
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition',
                        isActive
                          ? 'border-[var(--copper)] bg-[var(--copper)] text-white'
                          : isCompleted
                            ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]'
                            : 'border-[var(--border)] text-[var(--text-muted)]',
                      ].join(' ')}
                    >
                      {isCompleted ? <Check size={15} /> : step.number}
                    </div>

                    <span
                      className={[
                        'hidden text-xs font-medium sm:block',
                        isActive
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-muted)]',
                      ].join(' ')}
                    >
                      {step.label}
                    </span>
                  </button>

                  {index < steps.length - 1 && (
                    <div className="mx-4 h-px flex-1 bg-[var(--border)]" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
            <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-500" />

            <p className="text-sm leading-5 text-[var(--text-secondary)]">
              {error}
            </p>
          </div>
        )}

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-sm sm:p-8">
          {currentStep === 'PROJECT' && (
            <ProjectStep form={form} updateField={updateField} />
          )}

          {currentStep === 'ENERGY' && (
            <EnergyStep form={form} updateField={updateField} />
          )}

          {currentStep === 'SITE' && (
            <SiteStep form={form} updateField={updateField} />
          )}

          {currentStep === 'PREFERENCES' && (
            <PreferencesStep form={form} updateField={updateField} />
          )}

          {currentStep === 'REVIEW' && <ReviewStep form={form} />}

          {currentStep === 'SUBMIT' && (
            <SubmitStep
              form={form}
              analysis={analysis}
              isSubmitting={isSubmitting}
              requestId={requestId}
              onSubmit={handleSubmit}
              onConfirm={handleConfirmAndOpen}
              onAnalysisChange={updateAnalysis}
            />
          )}
        </section>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--text-primary)]/[0.04] hover:text-[var(--text-primary)] disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          {currentStep !== 'SUBMIT' && (
            <button
              type="button"
              onClick={() => void goNext()}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[var(--text-primary)] px-5 py-2.5 text-sm font-medium text-[var(--bg-primary)] transition hover:opacity-90 disabled:opacity-50"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                            */
/* -------------------------------------------------------------------------- */

interface StepProps {
  form: SolarRequestForm
  updateField: <K extends keyof SolarRequestForm>(
    field: K,
    value: SolarRequestForm[K],
  ) => void
}

function StepHeader({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="mb-8">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
        Step {number}
      </p>

      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
    </div>
  )
}

function FieldLabel({
  children,
  optional = false,
}: {
  children: React.ReactNode
  optional?: boolean
}) {
  return (
    <label className="mb-2 block text-sm font-medium">
      {children}

      {optional && (
        <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
          Optional
        </span>
      )}
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--copper)]'

const selectClass =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--copper)]'

function OptionCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean
  title: string
  description?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-xl border p-4 text-left transition',
        selected
          ? 'border-[var(--copper)] bg-[var(--copper)]/[0.06]'
          : 'border-[var(--border)] hover:border-[var(--text-secondary)]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{title}</p>

          {description && (
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>

        <div
          className={[
            'mt-0.5 h-4 w-4 rounded-full border',
            selected
              ? 'border-[var(--copper)] bg-[var(--copper)]'
              : 'border-[var(--border)]',
          ].join(' ')}
        />
      </div>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 01                                                                    */
/* -------------------------------------------------------------------------- */

function ProjectStep({ form, updateField }: StepProps) {
  return (
    <div className="max-w-3xl">
      <StepHeader
        number="01"
        title="What are you trying to achieve?"
        description="Start with a simple description. You don't need to know technical solar terminology."
      />

      <div className="space-y-6">
        <div>
          <FieldLabel>Project name</FieldLabel>

          <input
            type="text"
            value={form.projectTitle}
            onChange={(e) => updateField('projectTitle', e.target.value)}
            placeholder="e.g. Home Solar System"
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel>Tell us about your project</FieldLabel>

            <span className="text-xs text-[var(--text-muted)]">
              Natural language is fine
            </span>
          </div>

          <textarea
            rows={7}
            value={form.projectDescription}
            onChange={(e) => updateField('projectDescription', e.target.value)}
            placeholder="For example: I need solar for my house in Tyre. My electricity bill is around $150 per month. I want something reliable and good quality, but I don't necessarily want the cheapest option."
            className={`${inputClass} resize-none leading-6`}
          />
        </div>

        <AIInfo />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 02                                                                    */
/* -------------------------------------------------------------------------- */

function EnergyStep({ form, updateField }: StepProps) {
  return (
    <div className="max-w-4xl">
      <StepHeader
        number="02"
        title="Help us understand your energy needs."
        description="Give us whatever information you know about your current electricity usage. You can leave technical details blank."
      />

      <div className="space-y-8">
        <div>
          <FieldLabel>Property type</FieldLabel>

          <div className="grid gap-3 sm:grid-cols-3">
            <OptionCard
              selected={form.propertyType === 'RESIDENTIAL'}
              title="Residential"
              description="House, apartment, villa or similar."
              onClick={() => updateField('propertyType', 'RESIDENTIAL')}
            />

            <OptionCard
              selected={form.propertyType === 'COMMERCIAL'}
              title="Commercial"
              description="Shop, office, warehouse or business."
              onClick={() => updateField('propertyType', 'COMMERCIAL')}
            />

            <OptionCard
              selected={form.propertyType === 'INSTITUTIONAL'}
              title="Institutional"
              description="School, NGO, facility or organization."
              onClick={() => updateField('propertyType', 'INSTITUTIONAL')}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>Average monthly electricity bill</FieldLabel>

            <div className="flex gap-2">
              <select
                value={form.currency}
                onChange={(e) =>
                  updateField(
                    'currency',
                    e.target.value as SolarRequestForm['currency'],
                  )
                }
                className="w-28 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-3 text-sm outline-none focus:border-[var(--copper)]"
              >
                <option value="USD">USD</option>
                <option value="LBP">LBP</option>
              </select>

              <input
                type="number"
                min="0"
                value={form.monthlyElectricityBill}
                onChange={(e) =>
                  updateField('monthlyElectricityBill', e.target.value)
                }
                placeholder="150"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <FieldLabel optional>Average monthly consumption</FieldLabel>

            <div className="relative">
              <input
                type="number"
                min="0"
                value={form.averageMonthlyConsumption}
                onChange={(e) =>
                  updateField('averageMonthlyConsumption', e.target.value)
                }
                placeholder="e.g. 500"
                className={`${inputClass} pr-16`}
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
                kWh
              </span>
            </div>
          </div>
        </div>

        <AIInfo text="SOLVRA can help estimate missing energy information from your description. Any AI suggestion will require your confirmation." />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 03                                                                    */
/* -------------------------------------------------------------------------- */

function SiteStep({ form, updateField }: StepProps) {
  return (
    <div className="max-w-4xl">
      <StepHeader
        number="03"
        title="Tell us about the installation site."
        description="Suppliers need basic site information to understand what kind of installation they are bidding on."
      />

      <div className="space-y-8">
        <div>
          <FieldLabel>Location</FieldLabel>

          <input
            type="text"
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="e.g. Tyre, South Lebanon"
            className={inputClass}
          />

          <p className="mt-2 text-xs text-[var(--text-muted)]">
            City or general area is enough at this stage.
          </p>
        </div>

        <div>
          <FieldLabel>Roof / installation type</FieldLabel>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <OptionCard
              selected={form.roofType === 'FLAT'}
              title="Flat roof"
              onClick={() => updateField('roofType', 'FLAT')}
            />

            <OptionCard
              selected={form.roofType === 'SLOPED'}
              title="Sloped roof"
              onClick={() => updateField('roofType', 'SLOPED')}
            />

            <OptionCard
              selected={form.roofType === 'GROUND'}
              title="Ground installation"
              onClick={() => updateField('roofType', 'GROUND')}
            />

            <OptionCard
              selected={form.roofType === 'UNKNOWN'}
              title="Not sure"
              description="Let suppliers assess it."
              onClick={() => updateField('roofType', 'UNKNOWN')}
            />
          </div>
        </div>

        <div>
          <FieldLabel>Property ownership</FieldLabel>

          <div className="grid gap-3 sm:grid-cols-3">
            <OptionCard
              selected={form.ownership === 'OWNED'}
              title="I own it"
              onClick={() => updateField('ownership', 'OWNED')}
            />

            <OptionCard
              selected={form.ownership === 'RENTED'}
              title="I rent it"
              onClick={() => updateField('ownership', 'RENTED')}
            />

            <OptionCard
              selected={form.ownership === 'OTHER'}
              title="Other / not sure"
              onClick={() => updateField('ownership', 'OTHER')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 04                                                                    */
/* -------------------------------------------------------------------------- */

function PreferencesStep({ form, updateField }: StepProps) {
  return (
    <div className="max-w-4xl">
      <StepHeader
        number="04"
        title="What matters most to you?"
        description="Your preferences help SOLVRA compare supplier proposals according to what you actually care about."
      />

      <div className="space-y-8">
        <div>
          <FieldLabel optional>Budget range</FieldLabel>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-2 block text-xs text-[var(--text-muted)]">
                Minimum
              </span>

              <input
                type="number"
                min="0"
                value={form.budgetMin}
                onChange={(e) => updateField('budgetMin', e.target.value)}
                placeholder="e.g. 3000"
                className={inputClass}
              />
            </div>

            <div>
              <span className="mb-2 block text-xs text-[var(--text-muted)]">
                Maximum
              </span>

              <input
                type="number"
                min="0"
                value={form.budgetMax}
                onChange={(e) => updateField('budgetMax', e.target.value)}
                placeholder="e.g. 10000"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <FieldLabel>What is your main priority?</FieldLabel>

          <div className="grid gap-3 sm:grid-cols-2">
            <OptionCard
              selected={form.priority === 'LOWEST_PRICE'}
              title="Lowest price"
              description="Minimize the upfront cost."
              onClick={() => updateField('priority', 'LOWEST_PRICE')}
            />

            <OptionCard
              selected={form.priority === 'BALANCED'}
              title="Balanced value"
              description="Balance cost, quality and performance."
              onClick={() => updateField('priority', 'BALANCED')}
            />

            <OptionCard
              selected={form.priority === 'QUALITY'}
              title="Quality"
              description="Prioritize equipment and system quality."
              onClick={() => updateField('priority', 'QUALITY')}
            />

            <OptionCard
              selected={form.priority === 'RELIABILITY'}
              title="Reliability"
              description="Prioritize dependable long-term operation."
              onClick={() => updateField('priority', 'RELIABILITY')}
            />
          </div>
        </div>

        <div>
          <FieldLabel optional>
            When would you like the system installed?
          </FieldLabel>

          <select
            value={form.targetTimeline}
            onChange={(e) =>
              updateField(
                'targetTimeline',
                e.target.value as SolarRequestForm['targetTimeline'],
              )
            }
            className={selectClass}
          >
            <option value="">Select a timeline</option>

            <option value="ASAP">As soon as possible</option>

            <option value="ONE_TO_THREE_MONTHS">Within 1–3 months</option>

            <option value="THREE_TO_SIX_MONTHS">Within 3–6 months</option>

            <option value="SIX_TO_TWELVE_MONTHS">Within 6–12 months</option>

            <option value="FLEXIBLE">I'm flexible</option>
          </select>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 05                                                                    */
/* -------------------------------------------------------------------------- */

function ReviewStep({ form }: { form: SolarRequestForm }) {
  return (
    <div className="max-w-4xl">
      <StepHeader
        number="05"
        title="Review your request."
        description="Check the information before SOLVRA interprets your requirements."
      />

      <div className="space-y-4">
        <ReviewSection title="Project">
          <ReviewRow label="Project name" value={form.projectTitle} />

          <ReviewRow label="Description" value={form.projectDescription} />
        </ReviewSection>

        <ReviewSection title="Energy">
          <ReviewRow
            label="Property type"
            value={formatValue(form.propertyType)}
          />

          <ReviewRow
            label="Monthly bill"
            value={
              form.monthlyElectricityBill
                ? `${form.currency} ${form.monthlyElectricityBill}`
                : ''
            }
          />

          <ReviewRow
            label="Monthly consumption"
            value={
              form.averageMonthlyConsumption
                ? `${form.averageMonthlyConsumption} kWh`
                : ''
            }
          />
        </ReviewSection>

        <ReviewSection title="Site">
          <ReviewRow label="Location" value={form.location} />

          <ReviewRow label="Installation" value={formatValue(form.roofType)} />

          <ReviewRow label="Ownership" value={formatValue(form.ownership)} />
        </ReviewSection>

        <ReviewSection title="Preferences">
          <ReviewRow
            label="Budget"
            value={
              form.budgetMin || form.budgetMax
                ? `${form.budgetMin || '—'} → ${form.budgetMax || '—'} ${form.currency}`
                : ''
            }
          />

          <ReviewRow label="Priority" value={formatValue(form.priority)} />

          <ReviewRow
            label="Timeline"
            value={formatValue(form.targetTimeline)}
          />
        </ReviewSection>
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-[var(--border)] p-4">
        <Sparkles
          size={17}
          className="mt-0.5 shrink-0 text-[var(--prism-cyan)]"
        />

        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Next, SOLVRA will interpret your natural-language description and
          extract additional requirements. You will review the AI interpretation
          before anything is confirmed.
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 06                                                                    */
/* -------------------------------------------------------------------------- */

function SubmitStep({
  analysis,
  isSubmitting,
  requestId,
  onSubmit,
  onConfirm,
  onAnalysisChange,
}: {
  form: SolarRequestForm
  analysis: AnalyzeRequestResult | null
  isSubmitting: boolean
  requestId: string | null
  onSubmit: () => void
  onConfirm: () => void
  onAnalysisChange: <K extends keyof AnalyzeRequestResult>(
    field: K,
    value: AnalyzeRequestResult[K],
  ) => void
}) {
  /*
   * Request has not been created yet.
   */
  if (!requestId) {
    return (
      <div className="mx-auto max-w-2xl py-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)]">
          {isSubmitting ? (
            <Loader2 size={28} className="animate-spin" />
          ) : (
            <Check size={28} />
          )}
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-[var(--copper)]">
          Ready to submit
        </p>

        <h2 className="mt-2 text-3xl font-semibold">Create your request.</h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
          SOLVRA will first save your request as a draft, then analyze your
          description so you can review what the AI understood.
        </p>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--copper)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing request...
            </>
          ) : (
            <>
              Analyze my request
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    )
  }

  /*
   * Request exists but AI analysis has not returned.
   */
  if (!analysis) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        {isSubmitting && (
          <Loader2
            size={30}
            className="mx-auto animate-spin text-[var(--copper)]"
          />
        )}

        <h2 className="mt-5 text-2xl font-semibold">
          SOLVRA is interpreting your request.
        </h2>

        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          We're extracting useful requirements from your description.
        </p>

        {!isSubmitting && (
          <button
            type="button"
            onClick={onSubmit}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--copper)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)]"
          >
            Retry analysis
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/[0.05]">
          <Sparkles size={28} className="text-[var(--prism-cyan)]" />
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-[var(--prism-cyan)]">
          AI interpretation
        </p>

        <h2 className="mt-2 text-3xl font-semibold">
          Here is what SOLVRA understood.
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
          Review these suggestions before confirming them. AI does not make the
          procurement decision.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <ReviewSection title="Extracted requirements">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Occupants / users
              </label>
              <input
                type="number"
                min="0"
                value={analysis.occupantsOrUsers ?? ''}
                onChange={(event) =>
                  onAnalysisChange(
                    'occupantsOrUsers',
                    event.target.value === ''
                      ? null
                      : Number(event.target.value),
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
                AC units
              </label>
              <input
                type="number"
                min="0"
                value={analysis.acUnitsCount ?? ''}
                onChange={(event) =>
                  onAnalysisChange(
                    'acUnitsCount',
                    event.target.value === ''
                      ? null
                      : Number(event.target.value),
                  )
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={analysis.backupRequired}
                onChange={(event) =>
                  onAnalysisChange('backupRequired', event.target.checked)
                }
                className="h-4 w-4"
              />
              Backup required
            </label>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Electricity situation
            </label>
            <textarea
              rows={3}
              value={analysis.currentElectricitySituation ?? ''}
              onChange={(event) =>
                onAnalysisChange(
                  'currentElectricitySituation',
                  event.target.value || null,
                )
              }
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Usage pattern
            </label>
            <p className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {analysis.usagePattern
                ? JSON.stringify(analysis.usagePattern)
                : 'Not provided'}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Preferences
            </label>
            <textarea
              rows={3}
              value={analysis.preferences ?? ''}
              onChange={(event) =>
                onAnalysisChange('preferences', event.target.value || null)
              }
              className={`${inputClass} resize-none`}
            />
          </div>
        </ReviewSection>

        <ReviewSection title="Goals">
          {analysis.goals.length > 0 ? (
            <div className="space-y-3">
              {analysis.goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check
                    size={15}
                    className="mt-0.5 shrink-0 text-[var(--copper)]"
                  />

                  <input
                    value={goal}
                    onChange={(event) => {
                      const nextGoals = [...analysis.goals]
                      nextGoals[index] = event.target.value
                      onAnalysisChange('goals', nextGoals)
                    }}
                    className={`${inputClass} flex-1`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      onAnalysisChange(
                        'goals',
                        analysis.goals.filter(
                          (_, goalIndex) => goalIndex !== index,
                        ),
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                    aria-label="Remove goal"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              No additional goals were detected.
            </p>
          )}

          <button
            type="button"
            onClick={() => onAnalysisChange('goals', [...analysis.goals, ''])}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]"
          >
            <Plus size={14} />
            Add goal
          </button>
        </ReviewSection>

        {analysis.missingInformation.length > 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--copper)]">
              Missing information
            </p>

            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              You can still confirm the request. These details may help
              suppliers provide more accurate proposals.
            </p>

            <div className="mt-4 space-y-2">
              {analysis.missingInformation.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--copper)]" />

                  <span className="text-sm text-[var(--text-secondary)]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.conflicts.length > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-5">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />

              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-500">
                Conflicts require attention
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {analysis.conflicts.map((conflict) => (
                <p
                  key={conflict}
                  className="text-sm text-[var(--text-secondary)]"
                >
                  {conflict}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-[#00E5FF]/10 bg-[#00E5FF]/[0.025] p-5">
          <div className="flex items-center gap-3">
            <Sparkles size={16} className="text-[var(--prism-cyan)]" />

            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--prism-cyan)]">
              AI-Suggested — Confirm to Save
            </p>
          </div>

          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Confidence: {Math.round(analysis.extractionConfidence * 100)}
            %. Review the interpretation before confirming.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting || analysis.conflicts.length > 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--copper)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--copper-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              Confirm & open request
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="text-xs text-[var(--text-muted)]">
          Your confirmation saves the requirements and opens the request for
          supplier bidding.
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Supporting components                                                      */
/* -------------------------------------------------------------------------- */

function AIInfo({
  text = 'SOLVRA can help structure this information using AI. AI suggestions will always require your confirmation before they are saved.',
}: {
  text?: string
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--text-primary)]/[0.025] p-4">
      <Sparkles
        size={17}
        className="mt-0.5 shrink-0 text-[var(--prism-cyan)]"
      />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--prism-cyan)]">
          AI-Suggested — Confirm to Save
        </p>

        <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
          {text}
        </p>
      </div>
    </div>
  )
}

function ReviewSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>

      <div className="space-y-3">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0 sm:grid-cols-[180px_1fr]">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>

      <span className="break-words text-sm">{value || 'Not provided'}</span>
    </div>
  )
}

function formatValue(value: string) {
  if (!value) return ''

  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default CreateSolarRequestPage

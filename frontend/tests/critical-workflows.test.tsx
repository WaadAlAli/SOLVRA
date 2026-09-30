import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from '../src/context/AuthContext'
import CreateSolarRequestPage from '../src/pages/Dashboard/CreateSolarRequest/CreateSolarRequestPage'
import ComparePage from '../src/pages/Dashboard/Compare/ComparePage'
import NegotiationsPage from '../src/pages/Dashboard/Negotiations/NegotiationsPage'
import SupplierBidFormPage from '../src/pages/Dashboard/Supplier/SupplierBidFormPage'
import { analyzeRequest, createRequest } from '../src/services/request.service'
import { awardBid } from '../src/services/award.service'
import {
  getEvaluation,
  runEvaluation,
  setEvaluationCriteria,
} from '../src/services/evaluation.service'
import { getMyRequests } from '../src/services/request.service'
import { getRequestComparison } from '../src/services/compare.service'
import {
  getMyNegotiations,
  getNegotiationById,
  sendNegotiationMessage,
} from '../src/services/negotiation.service'
import {
  getSupplierRequestById,
  submitSupplierBid,
} from '../src/services/supplier.service'
import { getCurrentUser } from '../src/services/auth.service'

vi.mock('../src/services/auth.service', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('../src/services/request.service', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('../src/services/request.service')>()
  return {
    ...original,
    analyzeRequest: vi.fn(),
    createRequest: vi.fn(),
    getMyRequests: vi.fn(),
  }
})

vi.mock('../src/services/award.service', () => ({
  awardBid: vi.fn(),
}))

vi.mock('../src/services/evaluation.service', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('../src/services/evaluation.service')>()
  return {
    ...original,
    getEvaluation: vi.fn(),
    runEvaluation: vi.fn(),
    setEvaluationCriteria: vi.fn(),
  }
})

vi.mock('../src/services/compare.service', () => ({
  getRequestComparison: vi.fn(),
}))

vi.mock('../src/services/negotiation.service', () => ({
  getMyNegotiations: vi.fn(),
  getNegotiationById: vi.fn(),
  sendNegotiationMessage: vi.fn(),
}))

vi.mock('../src/services/supplier.service', () => ({
  getSupplierRequestById: vi.fn(),
  submitSupplierBid: vi.fn(),
}))

vi.mock('../src/components/dashboard/DashboardShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const requestId = 'request-123'
const bidVersionId = 'version-123'

const analysis = {
  hasRelevantAdditionalInfo: false,
  relevanceReason: null,
  occupantsOrUsers: null,
  acUnitsCount: null,
  applianceLoad: null,
  usagePattern: null,
  backupRequired: false,
  currentElectricitySituation: null,
  goals: [],
  preferences: null,
  extractionConfidence: 0.9,
  missingInformation: [],
  conflicts: [],
}

const evaluationResult = {
  id: 'result-1',
  bidVersionId,
  requestId,
  tcoAmount: 12000,
  criterionScores: {},
  weightedTotalScore: 85,
  rank: 1,
  isCompliant: true,
  computedAt: '2026-09-30T10:00:00.000Z',
  bidVersion: {
    id: bidVersionId,
    bidId: 'bid-1',
    versionNumber: 1,
    panelCapacityKw: 5,
    batteryCapacityKwh: 0,
    batteryType: null,
    inverterSpec: null,
    equipmentDetails: null,
    installationCost: 10000,
    deliveryCost: 500,
    commissioningCost: 500,
    maintenanceCost: 1000,
    warrantyYears: 10,
    deliveryTimeDays: 30,
    paymentTerms: null,
    totalPrice: 11000,
    extractionSource: 'MANUAL_ENTRY',
    extractionConfirmed: true,
    changeSummary: null,
    createdAt: '2026-09-30T10:00:00.000Z',
    bid: {
      id: 'bid-1',
      requestId,
      supplierId: 'supplier-1',
      status: 'SUBMITTED',
      supplier: { id: 'supplier-1', companyName: 'Sun Supplier' },
    },
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getCurrentUser).mockResolvedValue({
    success: true,
    user: { id: 'user-1', email: 'buyer@example.com', role: 'BUYER' },
  } as Awaited<ReturnType<typeof getCurrentUser>>)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderRoute(element: ReactNode, path: string, routePattern = '*') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePattern} element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('critical frontend workflows', () => {
  it('creates a request draft and analyzes that same request', async () => {
    const user = userEvent.setup()
    vi.mocked(createRequest).mockResolvedValue({
      success: true,
      request: { id: requestId },
    } as Awaited<ReturnType<typeof createRequest>>)
    vi.mocked(analyzeRequest).mockResolvedValue({
      success: true,
      analysis,
    })

    renderRoute(<CreateSolarRequestPage />, '/dashboard/requests/new')

    await user.type(
      screen.getByPlaceholderText('e.g. Home Solar System'),
      'Home solar',
    )
    await user.type(
      screen.getByPlaceholderText(/For example: I need solar/),
      'Reliable home system',
    )
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByText('Residential'))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.type(
      screen.getByPlaceholderText('e.g. Tyre, South Lebanon'),
      'Tyre',
    )
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByText('Lowest price'))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Analyze my request' }))

    await waitFor(() =>
      expect(createRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Home solar',
          propertyType: 'RESIDENTIAL',
          location: 'Tyre',
          rawDescription: 'Reliable home system',
          priority: 'LOWEST_PRICE',
        }),
      ),
    )
    expect(analyzeRequest).toHaveBeenCalledWith(requestId)
  })

  it('submits supplier bid values as numeric payload fields', async () => {
    const user = userEvent.setup()
    vi.mocked(getSupplierRequestById).mockResolvedValue({
      success: true,
      request: { title: 'Home solar request' },
    } as Awaited<ReturnType<typeof getSupplierRequestById>>)
    vi.mocked(submitSupplierBid).mockResolvedValue({ success: true } as Awaited<
      ReturnType<typeof submitSupplierBid>
    >)

    renderRoute(
      <SupplierBidFormPage />,
      '/supplier/requests/request-1/bid',
      '/supplier/requests/:requestId/bid',
    )

    await screen.findByRole('heading', {
      name: /Submit proposal for Home solar request/,
    })
    await user.type(
      screen.getByPlaceholderText('e.g. Standard Package'),
      'Core package',
    )

    const numberInputs = screen.getAllByRole('spinbutton')
    await user.type(numberInputs[0], '5')
    await user.type(numberInputs[2], '10000')
    await user.type(numberInputs[3], '500')
    await user.type(numberInputs[4], '250')
    await user.type(numberInputs[8], '10750')
    await user.click(screen.getByRole('button', { name: 'Submit bid' }))

    await waitFor(() =>
      expect(submitSupplierBid).toHaveBeenCalledWith(
        'request-1',
        expect.objectContaining({
          title: 'Core package',
          panelCapacityKw: 5,
          installationCost: 10000,
          deliveryCost: 500,
          commissioningCost: 250,
          totalPrice: 10750,
          extractionSource: 'MANUAL_ENTRY',
          extractionConfirmed: true,
        }),
      ),
    )
  })

  it('sends a trimmed negotiation message', async () => {
    const user = userEvent.setup()
    vi.mocked(getMyNegotiations).mockResolvedValue({
      success: true,
      negotiations: [
        {
          id: 'negotiation-1',
          status: 'ACTIVE',
          createdAt: '2026-09-30T10:00:00.000Z',
          request: {
            id: requestId,
            title: 'Home solar',
            status: 'NEGOTIATING',
            currency: 'USD',
            budget: null,
          },
          supplier: { id: 'supplier-1', companyName: 'Sun Supplier' },
          proposal: {
            bidId: 'bid-1',
            price: 10000,
            currency: 'USD',
            versionNumber: 1,
            updatedAt: null,
          },
          lastActivityAt: '2026-09-30T10:00:00.000Z',
          messageCount: 0,
        },
      ],
    })
    vi.mocked(getNegotiationById).mockResolvedValue({
      success: true,
      negotiation: {
        id: 'negotiation-1',
        status: 'ACTIVE',
        createdAt: '2026-09-30T10:00:00.000Z',
        request: {
          id: requestId,
          title: 'Home solar',
          status: 'NEGOTIATING',
          currency: 'USD',
          budget: null,
        },
        supplier: { id: 'supplier-1', companyName: 'Sun Supplier' },
        proposal: {
          bidId: 'bid-1',
          price: 10000,
          currency: 'USD',
          versionNumber: 1,
          updatedAt: null,
        },
        messages: [],
      },
    })
    vi.mocked(sendNegotiationMessage).mockResolvedValue({
      success: true,
      message: 'Sent',
      entry: {
        id: 'message-1',
        content: 'Can you adjust delivery?',
        authorType: 'BUYER',
        createdAt: '2026-09-30T10:01:00.000Z',
        sender: null,
      },
    })

    render(
      <AuthProvider>
        <MemoryRouter>
          <NegotiationsPage />
        </MemoryRouter>
      </AuthProvider>,
    )

    await user.click(await screen.findByRole('button', { name: /Home solar/ }))
    const messageBox = await screen.findByPlaceholderText(
      /Discuss pricing, delivery/,
    )
    await user.type(messageBox, '  Can you adjust delivery?  ')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() =>
      expect(sendNegotiationMessage).toHaveBeenCalledWith('negotiation-1', {
        content: 'Can you adjust delivery?',
      }),
    )
  })

  it('evaluates compliant bids and awards only after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(getMyRequests).mockResolvedValue({
      success: true,
      requests: [{ id: requestId, title: 'Home solar', status: 'OPEN' }],
    } as Awaited<ReturnType<typeof getMyRequests>>)
    vi.mocked(getRequestComparison).mockResolvedValue({
      success: true,
      request: {
        id: requestId,
        title: 'Home solar',
        status: 'OPEN',
        location: 'Tyre',
        currency: 'USD',
      },
      bids: [
        {
          id: 'bid-1',
          status: 'SUBMITTED',
          supplier: {
            id: 'supplier-1',
            companyName: 'Sun Supplier',
            certifications: null,
            serviceAreas: [],
            verifiedByAdmin: true,
          },
          version: {
            id: bidVersionId,
            versionNumber: 1,
            createdAt: '2026-09-30T10:00:00.000Z',
          },
          currency: 'USD',
          totalPrice: 11000,
          systemCapacity: 5,
          batteryStorageKwh: null,
          inverter: null,
          warrantyYears: 10,
          estimatedAnnualProduction: null,
          installationTimelineDays: 30,
          paymentTerms: null,
          supplierNotes: null,
          missingInformation: [],
        },
      ],
    } as Awaited<ReturnType<typeof getRequestComparison>>)
    vi.mocked(getEvaluation).mockResolvedValue({ success: true, results: [] })
    vi.mocked(setEvaluationCriteria).mockResolvedValue({
      success: true,
      message: 'Saved',
      criteria: [],
    })
    vi.mocked(runEvaluation).mockResolvedValue({
      success: true,
      results: [evaluationResult],
    })
    vi.mocked(awardBid).mockResolvedValue({
      success: true,
      message: 'Awarded',
      award: {},
    } as Awaited<ReturnType<typeof awardBid>>)

    renderRoute(<ComparePage />, '/dashboard/compare')

    await user.click(
      await screen.findByRole('button', { name: 'Run Evaluation' }),
    )
    await screen.findByRole('heading', { name: 'Evaluation Results' })
    await user.click(screen.getByRole('button', { name: 'Award Supplier' }))

    await waitFor(() =>
      expect(setEvaluationCriteria).toHaveBeenCalledWith(
        requestId,
        expect.arrayContaining([
          expect.objectContaining({ name: 'PRICE', weightPercent: 40 }),
        ]),
      ),
    )
    expect(runEvaluation).toHaveBeenCalledWith(requestId)
    expect(window.confirm).toHaveBeenCalled()
    expect(awardBid).toHaveBeenCalledWith(requestId, bidVersionId)
  })
})

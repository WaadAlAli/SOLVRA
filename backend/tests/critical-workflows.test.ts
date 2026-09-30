import type { Request } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const prisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  buyerProfile: { findUnique: vi.fn() },
  supplierProfile: { findUnique: vi.fn() },
  solarRequest: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  bid: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  bidVersion: { create: vi.fn(), findUnique: vi.fn() },
  negotiation: { create: vi.fn(), findFirst: vi.fn() },
  award: { findUnique: vi.fn(), create: vi.fn() },
  activityLog: { create: vi.fn() },
  $transaction: vi.fn(),
}))

const chatCompletion = vi.hoisted(() => vi.fn())

vi.mock('../src/config/prisma.js', () => ({ prisma }))
vi.mock('../src/services/auth.service.js', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}))
vi.mock('../src/services/email.service.js', () => ({
  sendPasswordResetEmail: vi.fn(),
}))
vi.mock('../src/services/ai/ai.client.js', () => ({
  hfClient: { chatCompletion },
}))
vi.mock('../src/utils/jwt.js', () => ({
  verifyAccessToken: vi.fn(() => ({ userId: 'user-1' })),
}))

import { getRequestInsights } from '../src/controllers/ai-insights.controller.js'
import { awardBid } from '../src/controllers/award.controller.js'
import { login } from '../src/controllers/auth.controller.js'
import { createNegotiation } from '../src/controllers/negotiation.controller.js'
import {
  createRequest,
  getRequestById,
} from '../src/controllers/request.controller.js'
import { runEvaluation } from '../src/controllers/evaluation.controller.js'
import {
  createSupplierBid,
  createSupplierBidVersion,
  getOpenRequestById,
} from '../src/controllers/supplier.controller.js'
import { extractRequirements } from '../src/services/ai/requirementExtraction.service.js'
import { loginUser } from '../src/services/auth.service.js'
import { authenticate } from '../src/middleware/auth.middleware.js'
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware.js'

function makeResponse() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  response.cookie.mockReturnValue(response)
  response.clearCookie.mockReturnValue(response)
  return response
}

function makeRequest(overrides: Record<string, unknown> = {}) {
  return {
    user: { userId: 'user-1', role: 'BUYER' },
    params: {},
    body: {},
    ...overrides,
  } as unknown as AuthenticatedRequest
}

const validBid = {
  title: 'Rooftop solar proposal',
  panelCapacityKw: 8,
  installationCost: 9000,
  deliveryCost: 300,
  commissioningCost: 200,
  totalPrice: 9500,
}

const requestUuid = '11111111-1111-4111-8111-111111111111'
const bidUuid = '22222222-2222-4222-8222-222222222222'

const validAiResult = {
  hasRelevantAdditionalInfo: true,
  relevanceReason: 'The buyer needs backup power.',
  occupantsOrUsers: null,
  acUnitsCount: null,
  applianceLoad: null,
  usagePattern: null,
  backupRequired: true,
  currentElectricitySituation: null,
  goals: [],
  preferences: null,
  extractionConfidence: 0.9,
  missingInformation: [],
  conflicts: [],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('critical backend workflows', () => {
  it('maps invalid login credentials to 401', async () => {
    vi.mocked(loginUser).mockRejectedValue(new Error('INVALID_CREDENTIALS'))
    const response = makeResponse()

    await login(
      {
        body: { email: 'buyer@example.com', password: 'wrong' },
      } as Request,
      response as never,
    )

    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    )
  })

  it('denies request reads when the buyer profile is missing', async () => {
    prisma.buyerProfile.findUnique.mockResolvedValue(null)
    const response = makeResponse()

    await getRequestById(
      makeRequest({ params: { id: 'request-1' } }),
      response as never,
    )

    expect(response.status).toHaveBeenCalledWith(403)
    expect(prisma.solarRequest.findFirst).not.toHaveBeenCalled()
  })

  it('rejects direct OPEN request creation before requirements are confirmed', async () => {
    prisma.buyerProfile.findUnique.mockResolvedValue({ id: 'buyer-1' })
    const response = makeResponse()

    await createRequest(
      makeRequest({
        body: {
          title: 'Home solar',
          propertyType: 'RESIDENTIAL',
          location: 'Austin',
          rawDescription: 'A residential solar project',
          status: 'OPEN',
        },
      }),
      response as never,
    )

    expect(response.status).toHaveBeenCalledWith(400)
    expect(prisma.solarRequest.create).not.toHaveBeenCalled()
  })

  it('rejects inactive users in authentication middleware', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: 'BUYER',
      isActive: false,
    })
    const response = makeResponse()
    const next = vi.fn()

    await authenticate(
      { cookies: { solvra_token: 'token' } } as never,
      response as never,
      next,
    )

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('scopes request lookup to the authenticated buyer', async () => {
    prisma.buyerProfile.findUnique.mockResolvedValue({ id: 'buyer-1' })
    prisma.solarRequest.findFirst.mockResolvedValue(null)
    const response = makeResponse()

    await getRequestById(
      makeRequest({ params: { id: 'request-1' } }),
      response as never,
    )

    expect(prisma.solarRequest.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'request-1', buyerId: 'buyer-1' },
      }),
    )
    expect(response.status).toHaveBeenCalledWith(404)
  })

  it('creates a supplier bid with its initial version for open requests', async () => {
    prisma.supplierProfile.findUnique.mockResolvedValue({ id: 'supplier-1' })
    prisma.solarRequest.findUnique.mockResolvedValue({
      id: requestUuid,
      status: 'OPEN',
    })
    prisma.bid.create.mockResolvedValue({ id: 'bid-1' })
    prisma.bid.findUnique.mockResolvedValue({
      id: 'bid-1',
      versions: [{ versionNumber: 1 }],
    })
    const response = makeResponse()

    await createSupplierBid(
      makeRequest({
        user: { userId: 'supplier-user', role: 'SUPPLIER' },
        params: { requestId: requestUuid },
        body: validBid,
      }),
      response as never,
    )

    expect(prisma.bid.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          supplierId: 'supplier-1',
          requestId: requestUuid,
          versions: {
            create: expect.objectContaining({ versionNumber: 1 }),
          },
        }),
      }),
    )
    expect(response.status).toHaveBeenCalledWith(201)
  })

  it('restricts bid revisions to their supplier and increments the version', async () => {
    prisma.supplierProfile.findUnique.mockResolvedValue({ id: 'supplier-1' })
    prisma.bid.findFirst.mockResolvedValue({
      id: bidUuid,
      status: 'SUBMITTED',
      request: { id: 'request-1', status: 'OPEN' },
      versions: [{ versionNumber: 2 }],
    })
    prisma.bidVersion.create.mockResolvedValue({ versionNumber: 3 })
    prisma.bid.findUnique.mockResolvedValue({
      id: bidUuid,
      versions: [{ versionNumber: 3 }],
    })
    const response = makeResponse()

    await createSupplierBidVersion(
      makeRequest({
        user: { userId: 'supplier-user', role: 'SUPPLIER' },
        params: { id: bidUuid },
        body: { ...validBid, title: undefined },
      }),
      response as never,
    )

    expect(prisma.bid.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: bidUuid, supplierId: 'supplier-1' },
      }),
    )
    expect(prisma.bidVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ versionNumber: 3 }),
      }),
    )
    expect(response.status).toHaveBeenCalledWith(201)
  })

  it('limits supplier request bid details to that supplier own bids', async () => {
    prisma.supplierProfile.findUnique.mockResolvedValue({
      id: 'supplier-1',
      companyName: 'Solar Supplier',
    })
    prisma.solarRequest.findFirst.mockResolvedValue({
      id: requestUuid,
      status: 'OPEN',
      bids: [],
    })
    const response = makeResponse()

    await getOpenRequestById(
      makeRequest({ params: { id: requestUuid } }),
      response as never,
    )

    expect(prisma.solarRequest.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          bids: expect.objectContaining({
            where: { supplierId: 'supplier-1' },
          }),
        }),
      }),
    )
  })

  it('starts negotiation only after evaluation and updates request status', async () => {
    prisma.buyerProfile.findUnique.mockResolvedValue({ id: 'buyer-1' })
    prisma.bid.findFirst.mockResolvedValue({
      id: bidUuid,
      requestId: requestUuid,
      status: 'SUBMITTED',
      request: { status: 'EVALUATING' },
    })
    prisma.negotiation.findFirst.mockResolvedValue(null)
    prisma.negotiation.create.mockResolvedValue({ id: 'negotiation-1' })
    prisma.$transaction.mockImplementation(async (operations) => operations)
    const response = makeResponse()

    await createNegotiation(
      makeRequest({
        params: { bidId: bidUuid },
      }),
      response as never,
    )

    expect(prisma.solarRequest.update).toHaveBeenCalledWith({
      where: { id: requestUuid },
      data: { status: 'NEGOTIATING' },
    })
    expect(response.status).toHaveBeenCalledWith(201)
  })

  it('prevents awarding a request before evaluation or negotiation', async () => {
    prisma.buyerProfile.findUnique.mockResolvedValue({ id: 'buyer-1' })
    prisma.solarRequest.findFirst.mockResolvedValue({
      id: 'request-1',
      status: 'OPEN',
    })
    const response = makeResponse()

    await awardBid(
      makeRequest({
        params: { requestId: 'request-1' },
        body: { bidVersionId: 'version-1' },
      }),
      response as never,
    )

    expect(response.status).toHaveBeenCalledWith(400)
    expect(prisma.bidVersion.findUnique).not.toHaveBeenCalled()
  })

  it('does not allow reevaluation after negotiation or award', async () => {
    prisma.buyerProfile.findUnique.mockResolvedValue({ id: 'buyer-1' })
    prisma.solarRequest.findFirst.mockResolvedValue({
      id: requestUuid,
      status: 'NEGOTIATING',
      evaluationCriteria: [],
      bids: [],
    })
    const response = makeResponse()

    await runEvaluation(
      makeRequest({ params: { requestId: requestUuid } }),
      response as never,
    )

    expect(response.status).toHaveBeenCalledWith(409)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('rejects non-JSON AI output', async () => {
    chatCompletion.mockResolvedValue({
      choices: [{ message: { content: 'not-json' } }],
    })

    await expect(
      extractRequirements({
        description: 'Backup power',
        propertyType: 'HOUSE',
        monthlyElectricityBill: null,
        averageMonthlyConsumption: null,
        location: 'Austin',
        roofType: null,
        ownership: null,
        budget: null,
        currency: null,
        priority: null,
        timeline: null,
      }),
    ).rejects.toThrow('AI returned invalid JSON')
  })

  it('handles empty AI output without an uncontrolled crash', async () => {
    chatCompletion.mockResolvedValue({ choices: [] })

    await expect(
      extractRequirements({
        description: 'Backup power',
        propertyType: 'HOUSE',
        monthlyElectricityBill: null,
        averageMonthlyConsumption: null,
        location: 'Austin',
        roofType: null,
        ownership: null,
        budget: null,
        currency: null,
        priority: null,
        timeline: null,
      }),
    ).rejects.toThrow('AI returned an empty response')
  })

  it('returns a generic application error when AI insights fail', async () => {
    prisma.buyerProfile.findUnique.mockResolvedValue({ id: 'buyer-1' })
    prisma.solarRequest.findFirst.mockResolvedValue({
      id: requestUuid,
      title: 'Home solar',
      status: 'EVALUATING',
      location: 'Austin',
      propertyType: 'RESIDENTIAL',
      rawDescription: 'A residential solar project',
      budget: null,
      currency: 'USD',
      monthlyElectricityBill: null,
      averageMonthlyConsumption: null,
      roofType: null,
      ownership: null,
      priority: null,
      timeline: null,
      requirementProfile: null,
      bids: [
        {
          id: bidUuid,
          status: 'SUBMITTED',
          supplier: { companyName: 'Solar Supplier' },
          versions: [],
        },
      ],
    })
    chatCompletion.mockRejectedValue(new Error('provider secret detail'))
    const response = makeResponse()

    await getRequestInsights(
      makeRequest({ params: { requestId: requestUuid } }),
      response as never,
    )

    expect(response.status).toHaveBeenCalledWith(500)
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to fetch AI insights',
    })
  })

  it('rejects AI JSON that violates the output schema', async () => {
    chatCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              ...validAiResult,
              extractionConfidence: 2,
            }),
          },
        },
      ],
    })

    await expect(
      extractRequirements({
        description: 'Backup power',
        propertyType: 'HOUSE',
        monthlyElectricityBill: null,
        averageMonthlyConsumption: null,
        location: 'Austin',
        roofType: null,
        ownership: null,
        budget: null,
        currency: null,
        priority: null,
        timeline: null,
      }),
    ).rejects.toThrow('AI returned an invalid requirement structure')
  })
})

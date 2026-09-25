import api from '../lib/api'

import type { SolarRequestForm } from '../types/request'

export interface CreateRequestInput {
  title: string
  propertyType: Exclude<
    SolarRequestForm['propertyType'],
    ''
  >
  location: string
  rawDescription: string

  currency?: Exclude<
    SolarRequestForm['currency'],
    ''
  >

  monthlyElectricityBill?: number
  averageMonthlyConsumption?: number

  roofType?: Exclude<
    SolarRequestForm['roofType'],
    ''
  >

  ownership?: Exclude<
    SolarRequestForm['ownership'],
    ''
  >

  budgetMin?: number
  budgetMax?: number

  priority?: Exclude<
    SolarRequestForm['priority'],
    ''
  >

  timeline?: Exclude<
    SolarRequestForm['targetTimeline'],
    ''
  >
}

export interface SolarRequest {
  id: string
  buyerId: string
  title: string
  propertyType: string
  location: string
  status: string
  budget: string | number | null
  currency: string | null
  rawDescription: string
  monthlyElectricityBill:
    | string
    | number
    | null
  averageMonthlyConsumption:
    | string
    | number
    | null
  roofType: string | null
  ownership: string | null
  priority: string | null
  timeline: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRequestResponse {
  success: boolean
  message?: string
  request: SolarRequest
}

export interface RequestResponse {
  success: boolean
  message?: string
  request: SolarRequest
}

export interface RequestsResponse {
  success: boolean
  requests: SolarRequest[]
}

export interface AnalyzeRequestResult {
  hasRelevantAdditionalInfo: boolean
  relevanceReason: string | null

  occupantsOrUsers: number | null
  acUnitsCount: number | null

  applianceLoad: Record<string, unknown> | null

  usagePattern: Record<string, unknown> | null

  backupRequired: boolean

  currentElectricitySituation: string | null

  goals: string[]

  preferences: string | null

  extractionConfidence: number

  missingInformation: string[]

  conflicts: string[]
}

export interface AnalyzeRequestResponse {
  success: boolean
  message?: string
  analysis: AnalyzeRequestResult
}

export interface ConfirmRequirementsInput {
  occupantsOrUsers?: number | null
  acUnitsCount?: number | null
  applianceLoad?: Record<string, unknown> | null
  usagePattern?: Record<string, unknown> | null
  backupRequired?: boolean
  currentElectricitySituation?: string | null
  goals?: string[]
  preferences?: string | null
  extractionConfidence?: number | null
  missingInformation?: string[]
  conflicts?: string[]
  confirmedByBuyer: true
}

export interface ConfirmRequirementsResponse {
  success: boolean
  message?: string
  requirementProfile: {
    id: string
    requestId: string
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
}

export interface RequestBidSupplier {
  id: string
  companyName: string
  serviceAreas: string[]
  certifications: string | null
  verifiedByAdmin: boolean
}

export interface RequestBidDocument {
  id: string
  fileUrl: string
  fileType: string
  uploadedAt: string
}

export interface RequestBidVersion {
  id: string
  bidId: string
  versionNumber: number
  panelCapacityKw: string | number | null
  batteryCapacityKwh: string | number | null
  batteryType: string | null
  inverterSpec: string | null
  equipmentDetails: Record<string, unknown> | null
  installationCost: string | number | null
  deliveryCost: string | number | null
  commissioningCost: string | number | null
  maintenanceCost: string | number | null
  warrantyYears: number | null
  deliveryTimeDays: number | null
  paymentTerms: string | null
  totalPrice: string | number | null
  extractionSource: string
  extractionConfirmed: boolean
  changeSummary: string | null
  createdAt: string
  documents: RequestBidDocument[]
}

export interface RequestBid {
  id: string
  requestId: string
  supplierId: string
  status: string
  createdAt: string
  updatedAt?: string
  supplier: RequestBidSupplier
  versions: RequestBidVersion[]
  latestVersion: RequestBidVersion | null
}

export interface GetRequestBidsResponse {
  success: boolean
  message?: string
  request: {
    id: string
    title: string
    status: string
    location: string
  }
  bids: RequestBid[]
}

export async function createRequest(
  input: CreateRequestInput,
): Promise<CreateRequestResponse> {
  const response = await api.post<CreateRequestResponse>(
    '/requests',
    input,
  )

  return response.data
}

export async function getMyRequests(): Promise<RequestsResponse> {
  const response = await api.get<RequestsResponse>(
    '/requests',
  )

  return response.data
}

export async function getRequestById(
  requestId: string,
): Promise<RequestResponse> {
  const response = await api.get<RequestResponse>(
    `/requests/${requestId}`,
  )

  return response.data
}
export async function updateRequest(
  requestId: string,
  input: Partial<CreateRequestInput>,
): Promise<RequestResponse> {
  const response = await api.patch<RequestResponse>(
    `/requests/${requestId}`,
    input,
  )

  return response.data
}

export async function deleteRequest(
  requestId: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await api.delete<{
    success: boolean
    message?: string
  }>(`/requests/${requestId}`)

  return response.data
}

export async function analyzeRequest(
  requestId: string,
): Promise<AnalyzeRequestResponse> {
  const response =
    await api.post<AnalyzeRequestResponse>(
      `/requests/${requestId}/analyze`,
    )

  return response.data
}

export async function confirmRequirements(
  requestId: string,
  input: ConfirmRequirementsInput,
): Promise<ConfirmRequirementsResponse> {
  const response =
    await api.post<ConfirmRequirementsResponse>(
      `/requests/${requestId}/requirements/confirm`,
      input,
    )

  return response.data
}

export async function openRequest(
  requestId: string,
): Promise<RequestResponse> {
  const response = await api.post<RequestResponse>(
    `/requests/${requestId}/open`,
  )

  return response.data
}
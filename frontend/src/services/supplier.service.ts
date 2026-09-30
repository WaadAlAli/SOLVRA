import api from '../lib/api'

export interface SupplierDashboardStats {
  openRequests: number
  activeBids: number
}

export interface SupplierBidVersion {
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
}

export interface SupplierRequest {
  id: string
  title: string
  propertyType: string
  location: string
  status: string
  budget: string | number | null
  currency: string | null
  rawDescription: string
  monthlyElectricityBill: string | number | null
  averageMonthlyConsumption: string | number | null
  roofType: string | null
  ownership: string | null
  priority: string | null
  timeline: string | null
  createdAt: string
  updatedAt: string
  requirementProfile?: Record<string, unknown> | null
  _count?: {
    bids: number
  }
}

export interface SupplierBid {
  id: string
  requestId: string
  supplierId: string
  title: string | null
  status: string
  createdAt: string
  request: {
    id: string
    title: string
    location: string
    status: string
    propertyType: string
    budget: string | number | null
    createdAt: string
  }
  versions: SupplierBidVersion[]
  latestVersion: SupplierBidVersion | null
}

export interface SupplierDashboardResponse {
  success: boolean
  stats: SupplierDashboardStats
  recentBids: SupplierBid[]
}

export interface SupplierRequestsResponse {
  success: boolean
  requests: SupplierRequest[]
}

export interface SupplierRequestResponse {
  success: boolean
  request: SupplierRequest
}

export interface SupplierProfile {
  id: string
  userId: string
  companyName: string
  serviceAreas: string[]
  capabilities: string[]
  certifications?: string | null
  verifiedByAdmin: boolean
  user?: {
    id: string
    email: string
    role: string
    isActive: boolean
    createdAt: string
  }
}

export interface SupplierProfileResponse {
  success: boolean
  message?: string
  profile: SupplierProfile
}

export interface UpdateSupplierProfileInput {
  companyName?: string
  serviceAreas?: string[]
  capabilities?: string[]
  certifications?: string | null
}

export interface SupplierBidPayload {
  title: string
  panelCapacityKw: number
  batteryCapacityKwh?: number | null
  batteryType?: string | null
  inverterSpec?: string | null
  equipmentDetails?: Record<string, unknown> | null
  installationCost: number
  deliveryCost: number
  commissioningCost: number
  maintenanceCost?: number | null
  warrantyYears?: number | null
  deliveryTimeDays?: number | null
  paymentTerms?: string | null
  totalPrice: number
  extractionSource?: 'MANUAL_ENTRY' | 'AI_EXTRACTED'
  extractionConfirmed?: boolean
  changeSummary?: string | null
}

export async function getSupplierProfile(): Promise<SupplierProfileResponse> {
  const response = await api.get<SupplierProfileResponse>('/supplier/profile')
  return response.data
}

export async function updateSupplierProfile(
  input: UpdateSupplierProfileInput,
): Promise<SupplierProfileResponse> {
  const response = await api.patch<SupplierProfileResponse>(
    '/supplier/profile',
    input,
  )
  return response.data
}

export async function getSupplierDashboard(): Promise<SupplierDashboardResponse> {
  const response = await api.get<SupplierDashboardResponse>('/supplier')
  return response.data
}

export async function getSupplierOpenRequests(): Promise<SupplierRequestsResponse> {
  const response = await api.get<SupplierRequestsResponse>('/supplier/requests')
  return response.data
}

export async function getSupplierRequestById(
  requestId: string,
): Promise<SupplierRequestResponse> {
  const response = await api.get<SupplierRequestResponse>(
    `/supplier/requests/${requestId}`,
  )
  return response.data
}

export async function submitSupplierBid(
  requestId: string,
  payload: SupplierBidPayload,
): Promise<{ success: boolean; message?: string; bid: SupplierBid }> {
  const response = await api.post<{
    success: boolean
    message?: string
    bid: SupplierBid
  }>(`/supplier/requests/${requestId}/bid`, payload)

  return response.data
}

export async function getMySupplierBids(): Promise<{
  success: boolean
  bids: SupplierBid[]
}> {
  const response = await api.get<{ success: boolean; bids: SupplierBid[] }>(
    '/supplier/bids',
  )
  return response.data
}

export async function getSupplierBidById(
  bidId: string,
): Promise<{ success: boolean; bid: SupplierBid }> {
  const response = await api.get<{ success: boolean; bid: SupplierBid }>(
    `/supplier/bids/${bidId}`,
  )
  return response.data
}

export async function submitSupplierBidVersion(
  bidId: string,
  payload: Omit<SupplierBidPayload, 'title'>,
): Promise<{ success: boolean; message?: string; bid: SupplierBid }> {
  const response = await api.post<{
    success: boolean
    message?: string
    bid: SupplierBid
  }>(`/supplier/bids/${bidId}/versions`, payload)

  return response.data
}

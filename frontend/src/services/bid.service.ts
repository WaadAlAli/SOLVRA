import api from '../lib/api'

export interface BidSupplier {
  id: string
  companyName: string
  serviceAreas: string[]
  certifications: string | null
  verifiedByAdmin: boolean
}

export interface BidDocument {
  id: string
  fileUrl: string
  fileType: string
  uploadedAt: string
}

export interface BidVersion {
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
  documents: BidDocument[]
}

export interface RequestBid {
  id: string
  requestId: string
  supplierId: string
  status: string
  createdAt: string
  updatedAt?: string
  supplier: BidSupplier
  versions: BidVersion[]
  latestVersion: BidVersion | null
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

export async function getRequestBids(
  requestId: string,
): Promise<GetRequestBidsResponse> {
  const response = await api.get<GetRequestBidsResponse>(
    `/requests/${requestId}/bids`,
  )

  return response.data
}

export async function getRequestBidById(
  requestId: string,
  bidId: string,
): Promise<{
  success: boolean
  message?: string
  request: {
    id: string
    title: string
    status: string
    location: string
  }
  bid: RequestBid
}> {
  const response = await api.get<{
    success: boolean
    message?: string
    request: {
      id: string
      title: string
      status: string
      location: string
    }
    bid: RequestBid
  }>(`/requests/${requestId}/bids/${bidId}`)

  return response.data
}

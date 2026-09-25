import api from '../lib/api'

export interface ComparisonSupplier {
  id: string
  companyName: string
  certifications: string | null
  serviceAreas: string[]
  verifiedByAdmin: boolean
}

export interface ComparisonVersion {
  id: string
  versionNumber: number
  createdAt: string
}

export interface ComparisonBid {
  id: string
  status: string
  supplier: ComparisonSupplier
  version: ComparisonVersion | null
  currency: string | null
  totalPrice: number | null
  systemCapacity: number | null
  batteryStorageKwh: number | null
  inverter: string | null
  warrantyYears: number | null
  estimatedAnnualProduction: number | null
  installationTimelineDays: number | null
  paymentTerms: string | null
  supplierNotes: string | null
  missingInformation: string[]
}

export interface CompareRequestResponse {
  success: boolean
  message?: string
  request: {
    id: string
    title: string
    status: string
    location: string
    currency: string | null
  }
  bids: ComparisonBid[]
}

export async function getRequestComparison(
  requestId: string,
): Promise<CompareRequestResponse> {
  const response = await api.get<CompareRequestResponse>(
    `/compare/requests/${requestId}`,
  )

  return response.data
}

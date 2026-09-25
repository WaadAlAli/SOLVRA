import api from '../lib/api'

export interface AiInsightEntry {
  bidId: string | null
  supplierName: string | null
  insight: string
}

export interface AiInsightMissingInfo {
  bidId: string | null
  supplierName: string | null
  item: string
  detail: string
}

export interface AiInsightConflict {
  bidId: string | null
  supplierName: string | null
  issue: string
}

export interface AiInsightConsideration {
  bidId: string | null
  supplierName: string | null
  item: string
  detail: string
}

export interface RequestInsightsResponse {
  success: boolean
  message?: string
  request: {
    id: string
    title: string
    status: string
    location: string
    currency: string | null
  }
  insights: {
    summary: string
    keyDifferences: AiInsightEntry[]
    missingInformation: AiInsightMissingInfo[]
    conflicts: AiInsightConflict[]
    considerations: AiInsightConsideration[]
    requiresConfirmation: boolean
  }
}

export async function getRequestInsights(
  requestId: string,
): Promise<RequestInsightsResponse> {
  const response = await api.get<RequestInsightsResponse>(
    `/requests/${requestId}/insights`,
  )

  return response.data
}

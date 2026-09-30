import api from '../lib/api'

export interface EvaluationCriterion {
  id?: string
  requestId?: string
  name:
    | 'PRICE'
    | 'TECHNICAL_COMPLIANCE'
    | 'WARRANTY'
    | 'DELIVERY'
    | 'MAINTENANCE'
    | 'PAYMENT_TERMS'
    | 'CUSTOM'
  weightPercent: number | string
}

export interface EvaluationResult {
  id: string
  bidVersionId: string
  requestId: string
  tcoAmount: number | string
  criterionScores: Record<string, number> | null
  weightedTotalScore: number | string
  rank: number
  isCompliant: boolean
  computedAt: string
  bidVersion?: {
    id: string
    bidId: string
    versionNumber: number
    panelCapacityKw: number | string
    batteryCapacityKwh: number | string
    batteryType: string | null
    inverterSpec: string | null
    equipmentDetails: Record<string, unknown> | null
    installationCost: number | string
    deliveryCost: number | string
    commissioningCost: number | string
    maintenanceCost: number | string
    warrantyYears: number
    deliveryTimeDays: number
    paymentTerms: string | null
    totalPrice: number | string
    extractionSource: string
    extractionConfirmed: boolean
    changeSummary: string | null
    createdAt: string
    bid?: {
      id: string
      requestId: string
      supplierId: string
      status: string
      supplier?: {
        id: string
        companyName: string
      }
    }
  }
}

export interface EvaluationResponse {
  success: boolean
  message?: string
  results: EvaluationResult[]
}

export interface SetCriteriaResponse {
  success: boolean
  message: string
  criteria: EvaluationCriterion[]
}

export async function setEvaluationCriteria(
  requestId: string,
  criteria: EvaluationCriterion[],
): Promise<SetCriteriaResponse> {
  const response = await api.put<SetCriteriaResponse>(
    `/evaluation/requests/${requestId}/criteria`,
    { criteria },
  )

  return response.data
}

export async function runEvaluation(
  requestId: string,
): Promise<EvaluationResponse> {
  const response = await api.post<EvaluationResponse>(
    `/evaluation/requests/${requestId}/run`,
  )

  return response.data
}

export async function getEvaluation(
  requestId: string,
): Promise<EvaluationResponse> {
  const response = await api.get<EvaluationResponse>(
    `/evaluation/requests/${requestId}`,
  )

  return response.data
}

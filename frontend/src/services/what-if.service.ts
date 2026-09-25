import api from '../lib/api'

export interface WhatIfScenarioInput {
  budget?: number | null
  batteryRequirementKwh?: number | null
  systemCapacityKw?: number | null
  priority?: 'LOWEST_PRICE' | 'BALANCED' | 'QUALITY' | 'RELIABILITY' | null
}

export interface WhatIfProposalImpact {
  bidId: string
  supplierName: string
  currentPrice: number | null
  currentCapacity: number | null
  currentBattery: number | null
  budgetFeasible: boolean
  capacityFit: boolean
  batteryFit: boolean
  requirementFit: boolean
}

export interface WhatIfResponse {
  success: boolean
  message?: string
  scenario?: {
    id: string
    requestId: string
    createdAt: string
  }
  result?: {
    summary: string
    request: {
      id: string
      title: string
      currentBudget: number | null
      hypotheticalBudget: number | null
      currentPriority: string | null
      hypotheticalPriority: string | null
      currentBatteryRequirement: boolean
      hypotheticalBatteryRequirement: number | null
      currentSystemCapacityKw: number | null
      hypotheticalSystemCapacityKw: number | null
    }
    profileImpact: {
      budgetChanged: boolean
      priorityChanged: boolean
      batteryChanged: boolean
      capacityChanged: boolean
    }
    affectedProposals: WhatIfProposalImpact[]
    feasibility: {
      totalProposals: number
      feasibleProposals: number
      budgetDelta: number | null
      canFitScenario: boolean
    }
    warnings: string[]
    isHypothetical: boolean
  }
}

export async function runWhatIfScenario(
  requestId: string,
  input: WhatIfScenarioInput,
): Promise<WhatIfResponse> {
  const response = await api.post<WhatIfResponse>(
    `/what-if/requests/${requestId}`,
    input,
  )

  return response.data
}

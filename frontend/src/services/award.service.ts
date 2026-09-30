import api from '../lib/api'

export interface Award {
  id: string
  requestId: string
  bidVersionId: string
  awardedByUserId: string
  awardedAt: string
}

export interface AwardResponse {
  success: boolean
  message: string
  award: Award
}

export async function awardBid(
  requestId: string,
  bidVersionId: string,
): Promise<AwardResponse> {
  const response = await api.post<AwardResponse>(
    `/award/requests/${requestId}`,
    { bidVersionId },
  )

  return response.data
}

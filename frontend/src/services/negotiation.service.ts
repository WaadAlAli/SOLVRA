import api from '../lib/api'

export interface NegotiationMessage {
  id: string
  content: string
  authorType: string
  createdAt: string
  sender: {
    id: string
    email: string
  } | null
}

export interface NegotiationSummary {
  id: string
  status: string
  createdAt: string
  request: {
    id: string
    title: string
    status: string
    currency: string | null
    budget: number | null
  }
  supplier: {
    id: string
    companyName: string
  }
  proposal: {
    bidId: string
    price: number | null
    currency: string | null
    versionNumber: number | null
    updatedAt: string | null
  }
  lastActivityAt: string
  messageCount: number
}

export interface NegotiationDetailResponse {
  success: boolean
  negotiation: {
    id: string
    status: string
    createdAt: string
    request: {
      id: string
      title: string
      status: string
      currency: string | null
      budget: number | null
    }
    supplier: {
      id: string
      companyName: string
    }
    proposal: {
      bidId: string
      price: number | null
      currency: string | null
      versionNumber: number | null
      updatedAt: string | null
    }
    messages: NegotiationMessage[]
  }
  message?: string
}

export interface NegotiationsListResponse {
  success: boolean
  negotiations: NegotiationSummary[]
  message?: string
}

export interface SendNegotiationMessageInput {
  content: string
}

export interface SendNegotiationMessageResponse {
  success: boolean
  message: string
  entry: NegotiationMessage
}
export interface CreateNegotiationResponse {
  success: boolean
  created?: boolean
  message: string
  negotiation: {
    id: string
    bidId: string
    status: string
    createdAt?: string
  }
}

export async function createNegotiation(
  bidId: string,
): Promise<CreateNegotiationResponse> {
  const response = await api.post<CreateNegotiationResponse>(
    `/negotiations/bids/${bidId}`,
  )

  return response.data
}

export async function getMyNegotiations(): Promise<NegotiationsListResponse> {
  const response = await api.get<NegotiationsListResponse>('/negotiations')
  return response.data
}

export async function getNegotiationById(
  negotiationId: string,
): Promise<NegotiationDetailResponse> {
  const response = await api.get<NegotiationDetailResponse>(
    `/negotiations/${negotiationId}`,
  )

  return response.data
}

export async function sendNegotiationMessage(
  negotiationId: string,
  input: SendNegotiationMessageInput,
): Promise<SendNegotiationMessageResponse> {
  const response = await api.post<SendNegotiationMessageResponse>(
    `/negotiations/${negotiationId}/messages`,
    input,
  )

  return response.data
}

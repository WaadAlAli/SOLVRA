import api from '../lib/api'

export interface BuyerDashboardStats {
  totalRequests: number
  draftRequests: number
  openRequests: number
  evaluatingRequests: number
  negotiatingRequests: number
  awardedRequests: number
}

export interface BuyerDashboardRequest {
  id: string
  title: string
  status: string
  location: string
  propertyType: string
  currency?: string | null
  budget?: string | number | null
  createdAt: string
  updatedAt: string
}

export interface BuyerDashboardActivity {
  id: string
  action: string
  createdAt: string
  description?: string
}

export interface BuyerDashboardResponse {
  success: boolean
  stats: BuyerDashboardStats
  recentRequests: BuyerDashboardRequest[]
  recentActivity: BuyerDashboardActivity[]
}

export async function getBuyerDashboard(): Promise<BuyerDashboardResponse> {
  const response = await api.get<BuyerDashboardResponse>(
    '/buyer/dashboard',
  )

  return response.data
}
export interface BuyerProfile {
  id: string
  userId?: string
  buyerType?: string | null
  displayName?: string | null
  location?: string | null
  phone?: string | null
  user?: {
    id: string
    email: string
    role: string
    isActive: boolean
    createdAt: string
  }
}

export interface BuyerProfileResponse {
  success: boolean
  message?: string
  profile: BuyerProfile
}

export interface UpdateBuyerProfileInput {
  displayName?: string
  buyerType?: string
  location?: string
  phone?: string
}

export async function getBuyerProfile(): Promise<BuyerProfileResponse> {
  const response = await api.get<BuyerProfileResponse>(
    '/buyer/profile',
  )

  return response.data
}

export async function updateBuyerProfile(
  input: UpdateBuyerProfileInput,
): Promise<BuyerProfileResponse> {
  const response = await api.patch<BuyerProfileResponse>(
    '/buyer/profile',
    input,
  )

  return response.data
}
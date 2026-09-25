export type UserRole = 'BUYER' | 'SUPPLIER' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  displayName?: string | null
  companyName?: string | null
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: AuthUser
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  confirmPassword: string
  role: 'BUYER' | 'SUPPLIER'
  displayName: string
  buyerType?: 'INDIVIDUAL' | 'BUSINESS' | 'INSTITUTION'
  location?: string
  phone?: string
  companyName?: string
}
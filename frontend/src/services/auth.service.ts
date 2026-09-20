import api from '../lib/api'
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from '../types/auth'

export async function login(
  input: LoginInput,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    '/auth/login',
    input,
  )

  return response.data
}

export async function register(
  input: RegisterInput,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    '/auth/register',
    input,
  )

  return response.data
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await api.get<AuthResponse>('/auth/me')

  return response.data
}

export async function logout(): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    '/auth/logout',
  )

  return response.data
}
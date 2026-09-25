import type { AuthUser } from '../types/auth'

export function getUserDisplayName(user: AuthUser | null | undefined): string {
  const supplierCompany = user?.companyName?.trim()
  if (user?.role === 'SUPPLIER' && supplierCompany) {
    return supplierCompany
  }

  const profileName = user?.displayName?.trim()
  if (profileName) {
    return profileName
  }

  const fallbackName = user?.email?.split('@')[0]?.trim()
  if (fallbackName) {
    return fallbackName.replace(/[._-]+/g, ' ')
  }

  return user?.role === 'SUPPLIER' ? 'Supplier' : 'Buyer'
}

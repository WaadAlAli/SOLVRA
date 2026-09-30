import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { getCurrentUser } from '../services/auth.service'
import type { AuthUser } from '../types/auth'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  refreshUser: () => Promise<void>
  clearUser: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await getCurrentUser()

      if (response.success && response.user) {
        setUser(response.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        await refreshUser()
      } finally {
        setLoading(false)
      }
    }

    void loadUser()
  }, [])

  const clearUser = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        clearUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

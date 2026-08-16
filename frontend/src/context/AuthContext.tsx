import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/auth'
import { getStoredToken, setAuthToken, TOKEN_KEY, USER_KEY } from '../api/client'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  initializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): User | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser())
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [initializing, setInitializing] = useState<boolean>(true)

  useEffect(() => {
    const storedToken = getStoredToken()
    if (storedToken) {
      setAuthToken(storedToken)
    }
    setInitializing(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    window.localStorage.setItem(TOKEN_KEY, res.token)
    window.localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setAuthToken(res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignora falhas de logout no servidor
    }
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
    setAuthToken(null)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, token, initializing, login, logout }),
    [user, token, initializing, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
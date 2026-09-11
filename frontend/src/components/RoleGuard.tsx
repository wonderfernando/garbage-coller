import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

export function roleHomePath(role: Role | null | undefined): string {
  switch (role) {
    case 'cliente':
      return '/cliente'
    case 'motorista':
      return '/motorista'
    case 'admin':
      return '/dashboard'
    default:
      return '/'
  }
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token, initializing } = useAuth()

  if (initializing) return null
  if (!token) return <Navigate to="/login" replace />

  return <>{children}</>
}

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useAuth()

  if (!user || user.role !== role) return <Navigate to={roleHomePath(user?.role)} replace />

  return <>{children}</>
}
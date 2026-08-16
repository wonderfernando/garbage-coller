import axios, { AxiosError } from 'axios'
import type { ApiError } from '../types'

export const TOKEN_KEY = 'elisal_token'
export const USER_KEY = 'elisal_user'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/ json',
    'Content-Type': 'application/json',
  },
})

export function setAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export function getStoredToken(): string | null {
  return typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null
}

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Lê as mensagens de erro devolvidas pela API em português
export function readApiError(err: unknown): string {
  const axiosError = err as AxiosError<ApiError>
  const data = axiosError?.response?.data

  if (!data) {
    return axiosError?.message || 'Ocorreu um erro inesperado.'
  }

  if (data.errors && Object.keys(data.errors).length > 0) {
    const first = Object.values(data.errors)[0]
    if (Array.isArray(first) && first.length > 0) return first[0]
  }

  return data.message || 'Ocorreu um erro inesperado.'
}
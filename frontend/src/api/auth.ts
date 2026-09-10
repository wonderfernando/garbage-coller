import { api } from './client'
import type { LoginResponse, RegistoInput, User } from '../types'

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/login', { email, password })
    return data
  },

  async registar(input: RegistoInput): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/registar', input)
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/me')
    return data
  },

  async logout(): Promise<void> {
    await api.post('/logout')
  },
}
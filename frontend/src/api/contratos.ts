import { api } from './client'
import type { Contrato } from '../types'

export const contratosApi = {
  async listarAdministracao(): Promise<Contrato[]> {
    const { data } = await api.get<Contrato[]>('/administracao/contratos')
    return data
  },

  async aprovar(id: number): Promise<Contrato> {
    const { data } = await api.patch<Contrato>(`/contratos/${id}/aprovar`)
    return data
  },

  async rejeitar(id: number): Promise<Contrato> {
    const { data } = await api.patch<Contrato>(`/contratos/${id}/rejeitar`)
    return data
  },
}
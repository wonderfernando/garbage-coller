import { api } from './client'
import type { AgendamentoRecolha } from '../types'

export const motoristaApi = {
  async cronograma(inicio?: string, fim?: string): Promise<AgendamentoRecolha[]> {
    const { data } = await api.get<AgendamentoRecolha[]>('/motorista/cronograma', {
      params: inicio && fim ? { inicio, fim } : {},
    })
    return data
  },

  async concluir(id: number): Promise<AgendamentoRecolha> {
    const { data } = await api.patch<AgendamentoRecolha>(`/motorista/agendamentos/${id}/concluir`)
    return data
  },

  async cancelar(id: number, observacao: string): Promise<AgendamentoRecolha> {
    const { data } = await api.patch<AgendamentoRecolha>(`/motorista/agendamentos/${id}/cancelar`, {
      observacao,
    })
    return data
  },
}
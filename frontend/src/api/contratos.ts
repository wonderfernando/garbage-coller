import { api } from './client'
import type { AgendamentoRecolha, Contrato, ParcelaMensalidade } from '../types'

export const contratosApi = {
  async listarAdministracao(): Promise<Contrato[]> {
    const { data } = await api.get<Contrato[]>('/administracao/contratos')
    return data
  },

  async detalheAdministracao(id: number): Promise<Contrato> {
    const { data } = await api.get<Contrato>(`/administracao/contratos/${id}`)
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

  async anularContrato(id: number, motivo?: string): Promise<Contrato> {
    const { data } = await api.patch<Contrato>(`/administracao/contratos/${id}/anular`, {
      motivo,
    })
    return data
  },

  async liquidarParcela(id: number, numeroRecibo?: string): Promise<ParcelaMensalidade> {
    const { data } = await api.patch<ParcelaMensalidade>(`/administracao/parcelas/${id}/liquidar`, {
      numero_recibo: numeroRecibo,
    })
    return data
  },

  async reciboParcela(id: number): Promise<Blob> {
    const { data } = await api.get<Blob>(`/administracao/parcelas/${id}/recibo`, { responseType: 'blob' })
    return data
  },

  async atribuirMotorista(agendamentoId: number, motoristaId: number | null): Promise<AgendamentoRecolha> {
    const { data } = await api.patch<AgendamentoRecolha>(`/administracao/agendamentos/${agendamentoId}/motorista`, {
      motorista_id: motoristaId,
    })
    return data
  },

  async reagendarAgendamento(agendamentoId: number, dataRecolha: string): Promise<AgendamentoRecolha> {
    const { data } = await api.patch<AgendamentoRecolha>(`/administracao/agendamentos/${agendamentoId}/reagendar`, {
      data_recolha: dataRecolha,
    })
    return data
  },
}
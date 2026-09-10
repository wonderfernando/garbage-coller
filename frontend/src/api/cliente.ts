import { api } from './client'
import type {
  AgendamentoRecolha,
  Contrato,
  CriarContratoInput,
  Distrito,
  ParcelaMensalidade,
  TipoResiduo,
} from '../types'

export const clienteApi = {
  async listarDistritos(): Promise<Distrito[]> {
    const { data } = await api.get<Distrito[]>('/distritos')
    return data
  },

  async listarTiposResiduos(): Promise<TipoResiduo[]> {
    const { data } = await api.get<TipoResiduo[]>('/tipos-residuos')
    return data
  },

  async meusContratos(): Promise<Contrato[]> {
    const { data } = await api.get<Contrato[]>('/contratos')
    return data
  },

  async detalheContrato(id: number): Promise<Contrato> {
    const { data } = await api.get<Contrato>(`/contratos/${id}`)
    return data
  },

  async criarContrato(input: CriarContratoInput): Promise<Contrato> {
    const { data } = await api.post<Contrato>('/contratos', input)
    return data
  },

  async meusParcelas(): Promise<ParcelaMensalidade[]> {
    const { data } = await api.get<ParcelaMensalidade[]>('/meus/parcelas')
    return data
  },

  async meusAgendamentos(): Promise<AgendamentoRecolha[]> {
    const { data } = await api.get<AgendamentoRecolha[]>('/meus/agendamentos')
    return data
  },
}
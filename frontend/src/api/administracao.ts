import { api } from './client'
import type {
  AgendamentoRecolha,
  Contrato,
  DashboardData,
  Distrito,
  Motorista,
  Provincia,
  TipoResiduo,
  User,
  Veiculo,
} from '../types'

export interface CreateUserInput {
  nome: string
  email: string
  password: string
  telefone: string
  role: 'admin' | 'motorista'
  numero_carta?: string
}

export interface CreateVeiculoInput {
  matricula: string
  modelo?: string
  motorista_id?: number | null
}

export interface UpdateVeiculoInput extends CreateVeiculoInput {}

export const administracaoApi = {
  async dashboard(): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>('/administracao/dashboard')
    return data
  },

  async listarProvincias(): Promise<Provincia[]> {
    const { data } = await api.get<Provincia[]>('/administracao/geografia')
    return data
  },

  async listarDistritos(): Promise<Distrito[]> {
    const { data } = await api.get<Distrito[]>('/administracao/distritos')
    return data
  },

  async listarUtilizadores(role?: 'admin' | 'motorista'): Promise<User[]> {
    const { data } = await api.get<User[]>('/administracao/utilizadores', {
      params: role ? { role } : {},
    })
    return data
  },

  async criarUtilizador(input: CreateUserInput): Promise<{ message: string; user: User }> {
    const { data } = await api.post('/administracao/utilizadores', input)
    return data
  },

  async listarClientes(): Promise<User[]> {
    const { data } = await api.get<User[]>('/administracao/clientes')
    return data
  },

  async getCliente(id: number): Promise<User> {
    const { data } = await api.get<User>(`/administracao/clientes/${id}`)
    return data
  },

  async listarContratosCliente(id: number): Promise<Contrato[]> {
    const { data } = await api.get<Contrato[]>(`/administracao/clientes/${id}/contratos`)
    return data
  },

  async listarAgendamentosCliente(id: number): Promise<AgendamentoRecolha[]> {
    const { data } = await api.get<AgendamentoRecolha[]>(`/administracao/clientes/${id}/agendamentos`)
    return data
  },

  async bloquearCliente(id: number, motivo: string): Promise<{ message: string; user: User }> {
    const { data } = await api.post(`/administracao/clientes/${id}/bloquear`, { motivo })
    return data
  },

  async desbloquearCliente(id: number): Promise<{ message: string; user: User }> {
    const { data } = await api.post(`/administracao/clientes/${id}/desbloquear`)
    return data
  },

  async listarMotoristas(): Promise<Motorista[]> {
    const { data } = await api.get<Motorista[]>('/administracao/motoristas')
    return data
  },

  async listarTiposResiduos(): Promise<TipoResiduo[]> {
    const { data } = await api.get<TipoResiduo[]>('/administracao/tipos-residuos')
    return data
  },

  async criarTipoResiduo(input: Omit<TipoResiduo, 'id'>): Promise<TipoResiduo> {
    const { data } = await api.post('/administracao/tipos-residuos', input)
    return data
  },

  async atualizarTipoResiduo(id: number, input: Omit<TipoResiduo, 'id'>): Promise<TipoResiduo> {
    const { data } = await api.patch(`/administracao/tipos-residuos/${id}`, input)
    return data
  },

  async eliminarTipoResiduo(id: number): Promise<void> {
    await api.delete(`/administracao/tipos-residuos/${id}`)
  },

  async listarVeiculos(): Promise<Veiculo[]> {
    const { data } = await api.get<Veiculo[]>('/administracao/veiculos')
    return data
  },

  async criarVeiculo(input: CreateVeiculoInput): Promise<Veiculo> {
    const { data } = await api.post('/administracao/veiculos', input)
    return data
  },

  async atualizarVeiculo(id: number, input: UpdateVeiculoInput): Promise<Veiculo> {
    const { data } = await api.patch(`/administracao/veiculos/${id}`, input)
    return data
  },

  async eliminarVeiculo(id: number): Promise<void> {
    await api.delete(`/administracao/veiculos/${id}`)
  },

  async adicionarDisponibilidade(distritoId: number, diaSemana: number): Promise<unknown> {
    const { data } = await api.post(`/administracao/distritos/${distritoId}/disponibilidade`, {
      dia_semana: diaSemana,
    })
    return data
  },

  async removerDisponibilidade(distritoId: number, diaSemana: number): Promise<void> {
    await api.delete(`/administracao/distritos/${distritoId}/disponibilidade/${diaSemana}`)
  },
}
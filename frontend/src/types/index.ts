export type Role = 'admin' | 'cliente' | 'motorista'

export interface User {
  id: number
  nome: string
  email: string
  role: Role
  telefone?: string | null
  endereco_principal?: string | null
  tipo_cliente?: 'particular' | 'empresa' | null
  nif?: string | null
  contratos_count?: number
  bloqueado?: boolean
  motivo_bloqueio?: string | null
  created_at?: string
}

export interface LoginResponse {
  message: string
  token: string
  user: User
}

export interface Provincia {
  id: number
  nome: string
  municipios?: Municipio[]
}

export interface Municipio {
  id: number
  provincia_id: number
  nome: string
  distritos?: Distrito[]
  provincia?: Provincia
}

export interface DisponibilidadeDistrito {
  id: number
  distrito_id: number
  dia_semana: number
}

export interface Distrito {
  id: number
  municipio_id: number
  nome: string
  municipio?: Municipio
  disponibilidades?: DisponibilidadeDistrito[]
}

export interface TipoResiduo {
  id: number
  nome: string
  descricao: string
  preco_unitario_recolha: number
  taxa_adesao: number
  created_at?: string
}

export interface ContratoDiaSemana {
  id: number
  contrato_id: number
  dia_semana: number
}

export type EstadoContrato = 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado'

export interface Contrato {
  id: number
  cliente_id: number
  distrito_id: number
  tipo_residuo_id: number
  taxa_adesao: number
  valor_mensal: number
  valor_total: number
  frequencia_semanal: number
  duracao_meses: number
  estado: EstadoContrato
  rua?: string | null
  ponto_referencia?: string | null
  latitude?: string | null
  longitude?: string | null
  created_at?: string
  cliente?: User
  distrito?: Distrito
  tipoResiduo?: TipoResiduo
  diasSemana?: ContratoDiaSemana[]
}

export interface Motorista {
  id: number
  utilizador_id: number
  utilizador?: User
}

export interface Veiculo {
  id: number
  matricula: string
  modelo?: string | null
  motorista_id?: number | null
  motorista?: Motorista
}

export interface ParcelaMensalidade {
  id: number
  contrato_id: number
  numero_parcela: number
  valor: number
  data_vencimento: string
  estado: 'pendente' | 'pago'
  data_pagamento?: string | null
  numero_recibo?: string | null
}

export interface AgendamentoRecolha {
  id: number
  contrato_id: number
  motorista_id?: number | null
  data_recolha: string
  estado: 'pendente' | 'concluido' | 'cancelado'
  observacao?: string | null
  contrato?: Contrato | null
  motorista?: Motorista | null
}

export interface ApiError {
  message?: string
  errors?: Record<string, string[]>
}

export interface DashboardStats {
  clientes: number
  contratos: number
  motoristas: number
  veiculos: number
}

export interface DashboardData {
  stats: DashboardStats
  ultimos_agendamentos: AgendamentoRecolha[]
  ultimos_contratos: Contrato[]
}

export const DIAS_SEMANA: { value: number; label: string }[] = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
]

export function nomeDiaSemana(dia: number): string {
  return DIAS_SEMANA.find((d) => d.value === dia)?.label ?? `Dia ${dia}`
}

export function formatMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  }).format(valor)
}

export function formatData(data?: string | null): string {
  if (!data) return '—'
  const date = new Date(data)
  if (Number.isNaN(date.getTime())) return data
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export const ESTADO_CONTRATO_LABEL: Record<EstadoContrato, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  cancelado: 'Cancelado',
}
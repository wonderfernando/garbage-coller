import type { AgendamentoRecolha, EstadoContrato } from '../../types'

export const ESTADO_CONTRATO_COLOR: Record<EstadoContrato, 'default' | 'success' | 'error' | 'warning'> = {
  pendente: 'warning',
  aprovado: 'success',
  rejeitado: 'error',
  cancelado: 'default',
}

export const AGENDAMENTO_ESTADO: Record<
  AgendamentoRecolha['estado'],
  { label: string; color: 'warning' | 'success' | 'error' }
> = {
  pendente: { label: 'Pendente', color: 'warning' },
  concluido: { label: 'Concluído', color: 'success' },
  cancelado: { label: 'Cancelado', color: 'error' },
}

export const PARCELA_ESTADO: Record<'pendente' | 'pago', { label: string; color: 'warning' | 'success' }> = {
  pendente: { label: 'Pendente', color: 'warning' },
  pago: { label: 'Pago', color: 'success' },
}
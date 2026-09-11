import { useCallback, useEffect, useState } from 'react'
import { Card, Chip, Stack, Typography } from '@mui/material'
import {
  CategoryOutlined,
  LocationOnOutlined,
  PersonOutlined,
  PlaceOutlined,
  DirectionsBusOutlined,
} from '@mui/icons-material'
import { administracaoApi } from '../../api/administracao'
import { readApiError } from '../../api/client'
import { ErrorState, LoadingState } from '../../components/StateView'
import CronogramaFiltro, { calcularRange } from '../../components/CronogramaFiltro'
import type { CronogramaModo } from '../../components/CronogramaFiltro'
import { formatData, nomeDiaSemana } from '../../types'
import type { AgendamentoRecolha } from '../../types'

const AGENDAMENTO_ESTADO: Record<
  AgendamentoRecolha['estado'],
  { label: string; color: 'default' | 'success' | 'error' | 'warning' }
> = {
  pendente: { label: 'Pendente', color: 'warning' },
  concluido: { label: 'Concluído', color: 'success' },
  cancelado: { label: 'Cancelado', color: 'error' },
}

export default function AgendamentosPage() {
  const [modo, setModo] = useState<CronogramaModo>('dia')
  const [dia, setDia] = useState<Date>(() => new Date())
  const [agendamentos, setAgendamentos] = useState<AgendamentoRecolha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { inicio, fim } = calcularRange(modo, dia)
    setLoading(true)
    setError(null)
    try {
      const data = await administracaoApi.listarAgendamentos(inicio, fim)
      setAgendamentos(data)
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [modo, dia])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Stack spacing={1.5}>
      <CronogramaFiltro title="Agendamentos" modo={modo} onModo={setModo} dia={dia} onDia={setDia} />

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : loading ? (
        <LoadingState />
      ) : agendamentos.length === 0 ? (
        <Card elevation={0}>
          <Typography sx={{ p: 4, textAlign: 'center' }} color="text.secondary">
            Não há recolhas agendadas para este período.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={1.5} sx={{ p: { xs: 1, sm: 0.5 } }}>
          {agendamentos.map((a) => {
            const data = new Date(a.data_recolha)
            const diaSemana = Number.isNaN(data.getTime()) ? null : data.getDay()
            return (
              <Card key={a.id} elevation={0} sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Stack>
                      <Typography variant="h6" sx={{ fontSize: '1.15rem', lineHeight: 1.2 }}>
                        {formatHora(a.data_recolha)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {diaSemana !== null ? `${nomeDiaSemana(diaSemana)} · ${formatData(a.data_recolha)}` : formatData(a.data_recolha)}
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      label={`Nº ${a.id}`}
                      variant="outlined"
                    />
                    <Chip size="small" label={AGENDAMENTO_ESTADO[a.estado].label} color={AGENDAMENTO_ESTADO[a.estado].color} />
                  </Stack>

                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <PersonOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {a.contrato?.cliente?.nome ?? `Cliente #${a.contrato_id}`}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <InfoRow icon={<PlaceOutlined />} text={a.contrato?.distrito?.nome ?? `#${a.contrato_id}`} />
                    <InfoRow icon={<CategoryOutlined />} text={a.contrato?.tipoResiduo?.nome ?? '—'} />
                    <InfoRow icon={<LocationOnOutlined />} text={a.contrato?.rua ?? 'Rua não indicada'} />
                    <InfoRow
                      icon={<DirectionsBusOutlined />}
                      text={a.motorista?.utilizador?.nome ?? 'Sem motorista atribuído'}
                    />
                  </Stack>
                </Stack>
              </Card>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <span style={{ color: 'var(--mui-palette-text-secondary)', display: 'flex' }}>{icon}</span>
      <Typography variant="body2">{text}</Typography>
    </Stack>
  )
}

function formatHora(data?: string | null): string {
  if (!data) return '—'
  const date = new Date(data)
  if (Number.isNaN(date.getTime())) return data
  return new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(date)
}
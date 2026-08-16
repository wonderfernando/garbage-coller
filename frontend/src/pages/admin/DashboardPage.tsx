import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Assignment,
  DirectionsBus,
  EventAvailable,
  Groups,
  Person,
  Schedule,
} from '@mui/icons-material'
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { administracaoApi } from '../../api/administracao'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView'
import { colors } from '../../theme'
import {
  ESTADO_CONTRATO_LABEL,
  formatData,
  formatMoeda,
} from '../../types'
import type {
  AgendamentoRecolha,
  DashboardData,
  EstadoContrato,
} from '../../types'

const AGENDAMENTO_ESTADO: Record<AgendamentoRecolha['estado'], { label: string; color: 'warning' | 'success' | 'error' }> = {
  pendente: { label: 'Pendente', color: 'warning' },
  concluido: { label: 'Concluído', color: 'success' },
  cancelado: { label: 'Cancelado', color: 'error' },
}

const CONTRATO_COLOR: Record<EstadoContrato, 'default' | 'success' | 'error' | 'warning'> = {
  pendente: 'warning',
  aprovado: 'success',
  rejeitado: 'error',
  cancelado: 'default',
}

function formatDataHora(data: string): string {
  const date = new Date(data)
  if (Number.isNaN(date.getTime())) return data
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

interface StatCardProps {
  to: string
  title: string
  desc: string
  icon: ReactNode
  value: number
}

function StatCard({ to, title, desc, icon, value }: StatCardProps) {
  const navigate = useNavigate()
  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardActionArea onClick={() => navigate(to)} sx={{ p: 3, height: '100%' }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: colors.green[50],
              color: colors.green[700],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4">{value}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {desc}
            </Typography>
          </Box>
        </Stack>
      </CardActionArea>
    </Card>
  )
}

function SummaryCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <Stack direction="row" spacing={1.5} sx={{ p: 2.5, alignItems: 'center' }}>
        <Box sx={{ color: colors.green[700], display: 'flex' }}>{icon}</Box>
        <Typography variant="h6">{title}</Typography>
      </Stack>
      <Divider />
      {children}
    </Card>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await administracaoApi.dashboard())
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!data) return null

  const stats = [
    { to: '/clientes', title: 'Clientes', desc: 'Contas de clientes registados', icon: <Groups />, value: data.stats.clientes },
    { to: '/contratos', title: 'Contratos', desc: 'Contratos de recolha abertos', icon: <Assignment />, value: data.stats.contratos },
    { to: '/utilizadores?role=motorista', title: 'Motoristas', desc: 'Motoristas da frota', icon: <Person />, value: data.stats.motoristas },
    { to: '/veiculos', title: 'Viaturas', desc: 'Veículos disponíveis', icon: <DirectionsBus />, value: data.stats.veiculos },
  ]

  return (
    <Box>
      <PageHeader
        title="Visão geral"
        subtitle="Resumo da atividade do sistema ELISAL-EP"
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid key={s.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SummaryCard title="Últimos agendamentos" icon={<EventAvailable />}>
            {data.ultimos_agendamentos.length === 0 ? (
              <EmptyState message="Ainda não existem agendamentos." />
            ) : (
              data.ultimos_agendamentos.map((a, i) => (
                <Box key={a.id}>
                  <Box sx={{ px: 2.5, py: 1.75 }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {a.contrato?.cliente?.nome ?? `Cliente #${a.contrato_id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {a.contrato?.distrito?.nome ?? 'Distrito —'} · {formatDataHora(a.data_recolha)}
                        </Typography>
                      </Box>
                      <Chip size="small" label={AGENDAMENTO_ESTADO[a.estado].label} color={AGENDAMENTO_ESTADO[a.estado].color} />
                    </Stack>
                  </Box>
                  {i < data.ultimos_agendamentos.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </SummaryCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SummaryCard title="Últimos contratos" icon={<Schedule />}>
            {data.ultimos_contratos.length === 0 ? (
              <EmptyState message="Ainda não existem contratos." />
            ) : (
              data.ultimos_contratos.map((c, i) => (
                <Box key={c.id}>
                  <Box sx={{ px: 2.5, py: 1.75 }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {c.cliente?.nome ?? `Cliente #${c.cliente_id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.tipoResiduo?.nome ?? 'Tipo de resíduo —'} · {formatData(c.created_at)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {formatMoeda(c.valor_mensal)}
                        </Typography>
                        <Chip size="small" label={ESTADO_CONTRATO_LABEL[c.estado]} color={CONTRATO_COLOR[c.estado]} />
                      </Stack>
                    </Stack>
                  </Box>
                  {i < data.ultimos_contratos.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </SummaryCard>
        </Grid>
      </Grid>
    </Box>
  )
}

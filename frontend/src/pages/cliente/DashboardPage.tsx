import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { EventAvailable, Payments, ReceiptLong, PendingActions } from '@mui/icons-material'
import { Box, Card, CardActionArea, Chip, Divider, Grid, Stack, Typography } from '@mui/material'
import { clienteApi } from '../../api/cliente'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView'
import { colors } from '../../theme'
import { AGENDAMENTO_ESTADO, ESTADO_CONTRATO_COLOR } from './estados'
import { ESTADO_CONTRATO_LABEL, formatData, formatMoeda } from '../../types'
import type { AgendamentoRecolha, Contrato, ParcelaMensalidade } from '../../types'

interface DashboardData {
  contratos: Contrato[]
  agendamentos: AgendamentoRecolha[]
  parcelas: ParcelaMensalidade[]
}

function StatCard({
  to,
  title,
  desc,
  icon,
  value,
}: {
  to: string
  title: string
  desc: string
  icon: ReactNode
  value: number | string
}) {
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [contratos, agendamentos, parcelas] = await Promise.all([
        clienteApi.meusContratos(),
        clienteApi.meusAgendamentos(),
        clienteApi.meusParcelas(),
      ])
      setData({ contratos, agendamentos, parcelas })
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

  const ativos = data.contratos.filter((c) => c.estado === 'aprovado').length
  const pendentesCt = data.contratos.filter((c) => c.estado === 'pendente').length
  const proximas = data.agendamentos.filter((a) => a.estado === 'pendente')
  const totalAberto = data.parcelas.filter((p) => p.estado === 'pendente').reduce((acc, p) => acc + Number(p.valor), 0)

  const stats = [
    { to: '/cliente/contratos', title: 'Contratos ativos', desc: 'Aprovados e em vigor', icon: <ReceiptLong />, value: ativos },
    { to: '/cliente/contratos', title: 'Pendentes', desc: 'A aguardar aprovação', icon: <PendingActions />, value: pendentesCt },
    { to: '/cliente/agendamentos', title: 'Próximas recolhas', desc: 'Recolhas pendentes', icon: <EventAvailable />, value: proximas.length },
    { to: '/cliente/financeiro', title: 'Em aberto', desc: 'Mensalidades pendentes', icon: <Payments />, value: formatMoeda(totalAberto) },
  ]

  return (
    <Box>
      <PageHeader title="Visão geral" subtitle="Resumo dos seus serviços de recolha ELISAL-EP" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid key={s.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6">Próximas recolhas</Typography>
            </Box>
            <Divider />
            {proximas.length === 0 ? (
              <EmptyState message="Sem recolhas agendadas." />
            ) : (
              proximas
                .slice(0, 5)
                .map((a, i) => (
                  <Box key={a.id}>
                    <Box sx={{ px: 2.5, py: 1.75 }}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {a.contrato?.tipoResiduo?.nome ?? `Contrato #${a.contrato_id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {a.contrato?.distrito?.nome ?? 'Distrito —'} · {formatData(a.data_recolha)}
                          </Typography>
                        </Box>
                        <Chip size="small" label={AGENDAMENTO_ESTADO[a.estado].label} color={AGENDAMENTO_ESTADO[a.estado].color} />
                      </Stack>
                    </Box>
                    {i < proximas.length - 1 && <Divider />}
                  </Box>
                ))
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ height: '100%' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6">Últimos contratos</Typography>
            </Box>
            <Divider />
            {data.contratos.length === 0 ? (
              <EmptyState message="Ainda não possui contratos." />
            ) : (
              data.contratos.slice(0, 5).map((c, i) => (
                <Box key={c.id}>
                  <Box sx={{ px: 2.5, py: 1.75 }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {c.tipoResiduo?.nome ?? `Contrato #${c.id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.distrito?.nome ?? 'Distrito —'} · {formatData(c.created_at)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {formatMoeda(c.valor_mensal)}
                        </Typography>
                        <Chip size="small" label={ESTADO_CONTRATO_LABEL[c.estado]} color={ESTADO_CONTRATO_COLOR[c.estado]} />
                      </Stack>
                    </Stack>
                  </Box>
                  {i < data.contratos.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
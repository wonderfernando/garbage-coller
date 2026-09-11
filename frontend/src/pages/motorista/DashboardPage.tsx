import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Card, Grid, Stack, Typography } from '@mui/material'
import {
  CancelOutlined,
  CheckCircleOutlined,
  EventAvailable,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { motoristaApi } from '../../api/motorista'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { ErrorState, LoadingState } from '../../components/StateView'
import RecolhaList from './RecolhaList'
import { colors } from '../../theme'
import type { AgendamentoRecolha } from '../../types'

function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function DashboardPage() {
  const [recolhas, setRecolhas] = useState<AgendamentoRecolha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    const hoje = toYmd(new Date())
    setLoading(true)
    setError(null)
    try {
      const data = await motoristaApi.cronograma(hoje, hoje)
      setRecolhas(data)
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const runAcao = async (id: number, acao: () => Promise<unknown>) => {
    setBusyId(id)
    setActionError(null)
    try {
      await acao()
      await load()
    } catch (err) {
      setActionError(readApiError(err))
      throw err
    } finally {
      setBusyId(null)
    }
  }

  const pendentes = recolhas.filter((a) => a.estado === 'pendente').length
  const concluidas = recolhas.filter((a) => a.estado === 'concluido').length
  const canceladas = recolhas.filter((a) => a.estado === 'cancelado').length

  return (
    <Stack spacing={1.5} sx={{ p: 1 }}>
      <PageHeader title="Visão geral" subtitle="Resumo das recolhas de hoje" />

      {actionError && (
        <Alert severity="error">{actionError}</Alert>
      )}

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : loading ? (
        <LoadingState />
      ) : (
        <>
          <Grid container spacing={1.5}>
            <StatCard
              icon={<EventAvailable />}
              label="Total hoje"
              value={recolhas.length}
              color={colors.green[700]}
              bg={colors.green[50]}
            />
            <StatCard
              icon={<ScheduleIcon />}
              label="Pendentes"
              value={pendentes}
              color="#b26a00"
              bg="#fff4e0"
            />
            <StatCard
              icon={<CheckCircleOutlined />}
              label="Concluídas"
              value={concluidas}
              color="#2e7d32"
              bg="#e8f5e9"
            />
            <StatCard
              icon={<CancelOutlined />}
              label="Canceladas"
              value={canceladas}
              color="#c62828"
              bg="#ffebee"
            />
          </Grid>

          <RecolhaList
            recolhas={recolhas}
            busyId={busyId}
            emptyMessage="Sem recolhas agendadas para hoje."
            onConcluir={(id) => runAcao(id, () => motoristaApi.concluir(id))}
            onCancelar={(id, obs) => runAcao(id, () => motoristaApi.cancelar(id, obs))}
          />
        </>
      )}
    </Stack>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  bg: string
}

function StatCard({ icon, label, value, color, bg }: StatCardProps) {
  return (
    <Grid size={{ xs: 6, sm: 3 }}>
      <Card elevation={0}>
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: bg,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6">{value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Grid>
  )
}
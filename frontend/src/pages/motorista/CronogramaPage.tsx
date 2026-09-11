import { useCallback, useEffect, useState } from 'react'
import { Alert, Card, Stack } from '@mui/material'
import { motoristaApi } from '../../api/motorista'
import { readApiError } from '../../api/client'
import { ErrorState, LoadingState } from '../../components/StateView'
import CronogramaFiltro, { calcularRange } from '../../components/CronogramaFiltro'
import type { CronogramaModo } from '../../components/CronogramaFiltro'
import RecolhaList from './RecolhaList'
import type { AgendamentoRecolha } from '../../types'

export default function CronogramaPage() {
  const [modo, setModo] = useState<CronogramaModo>('dia')
  const [dia, setDia] = useState<Date>(() => new Date())
  const [recolhas, setRecolhas] = useState<AgendamentoRecolha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    const { inicio, fim } = calcularRange(modo, dia)
    setLoading(true)
    setError(null)
    try {
      const data = await motoristaApi.cronograma(inicio, fim)
      setRecolhas(data)
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [modo, dia])

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

  return (
    <Stack spacing={1.5} sx={{ p: 1 }}>
      <CronogramaFiltro title="Cronograma" modo={modo} onModo={setModo} dia={dia} onDia={setDia} />

      {actionError && <Alert severity="error">{actionError}</Alert>}

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : loading ? (
        <LoadingState />
      ) : (
        <Card elevation={0}>
          <RecolhaList
            recolhas={recolhas}
            busyId={busyId}
            emptyMessage="Não há recolhas agendadas para este período."
            onConcluir={(id) => runAcao(id, () => motoristaApi.concluir(id))}
            onCancelar={(id, obs) => runAcao(id, () => motoristaApi.cancelar(id, obs))}
          />
        </Card>
      )}
    </Stack>
  )
}
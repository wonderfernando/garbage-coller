import { useCallback, useEffect, useState } from 'react'
import { Card, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { clienteApi } from '../../api/cliente'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView'
import { AGENDAMENTO_ESTADO } from './estados'
import { formatData } from '../../types'
import type { AgendamentoRecolha } from '../../types'

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoRecolha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setAgendamentos(await clienteApi.meusAgendamentos())
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const proximas = agendamentos
    .filter((a) => a.estado === 'pendente')
    .sort((a, b) => b.data_recolha.localeCompare(a.data_recolha))

  return (
    <div>
      <PageHeader
        title="Agendamentos"
        subtitle="Próximas recolhas e histórico dos seus contratos"
      />
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : loading ? (
        <LoadingState />
      ) : agendamentos.length === 0 ? (
        <Card elevation={0}>
          <EmptyState message="Sem recolhas agendadas. Os agendamentos são criados após a aprovação do contrato." />
        </Card>
      ) : (
        <>
          {proximas.length > 0 && (
            <Card elevation={0} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Próximas recolhas
              </Typography>
              <Stack spacing={1.5}>
                {proximas.slice(0, 5).map((a) => (
                  <Stack key={a.id} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120 }}>
                      {formatData(a.data_recolha)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.contrato?.tipoResiduo?.nome ?? `Contrato #${a.contrato_id}`} ·{' '}
                      {a.contrato?.distrito?.nome ?? '—'}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          )}

          <Card elevation={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Contrato</TableCell>
                    <TableCell>Tipo de resíduo</TableCell>
                    <TableCell>Distrito</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agendamentos.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatData(a.data_recolha)}
                        </Typography>
                      </TableCell>
                      <TableCell>#{a.contrato_id}</TableCell>
                      <TableCell>{a.contrato?.tipoResiduo?.nome ?? '—'}</TableCell>
                      <TableCell>{a.contrato?.distrito?.nome ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={AGENDAMENTO_ESTADO[a.estado].label}
                          color={AGENDAMENTO_ESTADO[a.estado].color}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </div>
  )
}
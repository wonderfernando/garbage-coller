import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Check, Close } from '@mui/icons-material'
import { contratosApi } from '../../api/contratos'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView'
import {
  ESTADO_CONTRATO_LABEL,
  formatMoeda,
  nomeDiaSemana,
} from '../../types'
import type { Contrato, EstadoContrato } from '../../types'

const ESTADO_COLOR: Record<EstadoContrato, 'default' | 'success' | 'error' | 'warning'> = {
  pendente: 'warning',
  aprovado: 'success',
  rejeitado: 'error',
  cancelado: 'default',
}

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await contratosApi.listarAdministracao()
      setContratos(data)
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const runAction = async (id: number, type: 'aprovar' | 'rejeitar') => {
    setBusyId(id)
    setActionError(null)
    try {
      await (type === 'aprovar' ? contratosApi.aprovar(id) : contratosApi.rejeitar(id))
      await load()
    } catch (err) {
      setActionError(readApiError(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Box>
      <PageHeader
        title="Contratos"
        subtitle="Aprovar ou rejeitar contratos de recolha abertos pelos clientes"
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : loading ? (
        <LoadingState />
      ) : contratos.length === 0 ? (
        <Card elevation={0}>
          <EmptyState message="Ainda não existem contratos." />
        </Card>
      ) : (
        <Card elevation={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Distrito</TableCell>
                  <TableCell>Tipo de resíduo</TableCell>
                  <TableCell align="right">Valor mensal</TableCell>
                  <TableCell>Dias</TableCell>
                  <TableCell>Duração</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contratos.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {c.cliente?.nome ?? '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.cliente?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{c.distrito?.nome ?? `#${c.distrito_id}`}</TableCell>
                    <TableCell>{c.tipoResiduo?.nome ?? '—'}</TableCell>
                    <TableCell align="right">{formatMoeda(c.valor_mensal)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                        {(c.diasSemana ?? []).map((d) => (
                          <Chip key={d.id} size="small" label={nomeDiaSemana(d.dia_semana)} />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>{c.duracao_meses} meses</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={ESTADO_CONTRATO_LABEL[c.estado]}
                        color={ESTADO_COLOR[c.estado]}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {c.estado === 'pendente' ? (
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<Check />}
                            disabled={busyId === c.id}
                            onClick={() => void runAction(c.id, 'aprovar')}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Close />}
                            disabled={busyId === c.id}
                            onClick={() => void runAction(c.id, 'rejeitar')}
                          >
                            Rejeitar
                          </Button>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  )
}
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { Box, Card, Chip, Divider, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { clienteApi } from '../../api/cliente'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView'
import { AGENDAMENTO_ESTADO, ESTADO_CONTRATO_COLOR, PARCELA_ESTADO } from './estados'
import { ESTADO_CONTRATO_LABEL, formatData, formatMoeda, nomeDiaSemana } from '../../types'
import type { Contrato } from '../../types'

export default function ContratoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      setContrato(await clienteApi.detalheContrato(Number(id)))
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Box>
      <PageHeader
        title={contrato ? `Contrato #${contrato.id}` : 'Contrato'}
        subtitle="Detalhes do contrato de recolha"
        actions={
          <Button startIcon={<ArrowBack />} onClick={() => window.history.back()} variant="outlined">
            Voltar
          </Button>
        }
      />
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : loading ? (
        <LoadingState />
      ) : !contrato ? (
        <EmptyState message="Contrato não encontrado." />
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ p: 3 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Ficha do contrato</Typography>
                <Chip label={ESTADO_CONTRATO_LABEL[contrato.estado]} color={ESTADO_CONTRATO_COLOR[contrato.estado]} />
              </Stack>

              <Stack spacing={1.5}>
                <InfoRow label="Tipo de resíduo" value={contrato.tipoResiduo?.nome ?? '—'} />
                <InfoRow label="Distrito" value={contrato.distrito?.nome ?? `#${contrato.distrito_id}`} />
                <InfoRow label="Dias de recolha" value={(contrato.diasSemana ?? []).map((d) => nomeDiaSemana(d.dia_semana)).join(', ')} />
                <InfoRow label="Frequência semanal" value={`${contrato.frequencia_semanal}x por semana`} />
                <InfoRow label="Duração" value={`${contrato.duracao_meses} meses`} />
                <InfoRow label="Rua" value={contrato.rua ?? '—'} />
                <InfoRow label="Ponto de referência" value={contrato.ponto_referencia ?? '—'} />
                <InfoRow label="Aberto em" value={formatData(contrato.created_at)} />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid size={4}>
                  <Typography variant="caption" color="text.secondary">
                    Taxa de adesão
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatMoeda(contrato.taxa_adesao)}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="caption" color="text.secondary">
                    Mensalidade
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatMoeda(contrato.valor_mensal)}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatMoeda(contrato.valor_total)}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ mb: 3, p: 0 }}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h6">Mensalidades</Typography>
              </Box>
              {!contrato.parcelas || contrato.parcelas.length === 0 ? (
                <EmptyState message="Sem parcelas geradas." />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Parcela</TableCell>
                        <TableCell>Vencimento</TableCell>
                        <TableCell align="right">Valor</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contrato.parcelas.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.numero_parcela}</TableCell>
                          <TableCell>{formatData(p.data_vencimento)}</TableCell>
                          <TableCell align="right">{formatMoeda(p.valor)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={PARCELA_ESTADO[p.estado].label} color={PARCELA_ESTADO[p.estado].color} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>

            <Card elevation={0} sx={{ p: 0 }}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h6">Agendamentos</Typography>
              </Box>
              {!contrato.agendamentos || contrato.agendamentos.length === 0 ? (
                <EmptyState message="Sem recolhas agendadas." />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contrato.agendamentos.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>{formatData(a.data_recolha)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={AGENDAMENTO_ESTADO[a.estado].label} color={AGENDAMENTO_ESTADO[a.estado].color} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  )
}
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { ArrowBack, Block, Check, Close, Event, Receipt } from '@mui/icons-material'
import { contratosApi } from '../../api/contratos'
import { administracaoApi } from '../../api/administracao'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView'
import { AGENDAMENTO_ESTADO, ESTADO_CONTRATO_COLOR, PARCELA_ESTADO } from '../cliente/estados'
import { ESTADO_CONTRATO_LABEL, formatData, formatMoeda, nomeDiaSemana } from '../../types'
import type { Contrato, Motorista, ParcelaMensalidade } from '../../types'

export default function ContratoDetalheAdminPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [parcelaPage, setParcelaPage] = useState(0)
  const [agendamentoPage, setAgendamentoPage] = useState(0)
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [liquidandoId, setLiquidandoId] = useState<number | null>(null)
  const [confirmarLiquidacaoId, setConfirmarLiquidacaoId] = useState<number | null>(null)
  const [aDescarregarReciboId, setADescarregarReciboId] = useState<number | null>(null)
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [atribuindoId, setAtribuindoId] = useState<number | null>(null)
  const [anularOpen, setAnularOpen] = useState(false)
  const [motivoAnular, setMotivoAnular] = useState('')
  const [reagendarAgendamentoId, setReagendarAgendamentoId] = useState<number | null>(null)
  const [novaDataRecolha, setNovaDataRecolha] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [c, m] = await Promise.all([
        contratosApi.detalheAdministracao(Number(id)),
        administracaoApi.listarMotoristas(),
      ])
      setContrato(c)
      setMotoristas(m)
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const runAction = async (type: 'aprovar' | 'rejeitar') => {
    if (!contrato) return
    setBusy(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      await (type === 'aprovar' ? contratosApi.aprovar(contrato.id) : contratosApi.rejeitar(contrato.id))
      setActionSuccess(type === 'aprovar' ? 'Contrato aprovado com sucesso.' : 'Contrato rejeitado com sucesso.')
      await load()
    } catch (err) {
      setActionError(readApiError(err))
    } finally {
      setBusy(false)
    }
  }

  const liquidarParcela = async (parcelaId: number) => {
    setLiquidandoId(parcelaId)
    setActionError(null)
    setActionSuccess(null)
    try {
      await contratosApi.liquidarParcela(parcelaId)
      setActionSuccess('Parcela liquidada com sucesso.')
      await load()
    } catch (err) {
      setActionError(readApiError(err))
    } finally {
      setLiquidandoId(null)
    }
  }

  const confirmarLiquidacao = async () => {
    if (confirmarLiquidacaoId === null) return
    const id = confirmarLiquidacaoId
    setConfirmarLiquidacaoId(null)
    await liquidarParcela(id)
  }

  const parcelaEmLiquidacao = contrato?.parcelas?.find((p) => p.id === confirmarLiquidacaoId) ?? null

  const descarregarRecibo = async (p: ParcelaMensalidade) => {
    setADescarregarReciboId(p.id)
    setActionError(null)
    try {
      const blob = await contratosApi.reciboParcela(p.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recibo-${p.numero_recibo ?? p.id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setActionError(readApiError(err))
    } finally {
      setADescarregarReciboId(null)
    }
  }

  const atribuirMotorista = async (agendamentoId: number, motoristaId: number | null) => {
    setAtribuindoId(agendamentoId)
    setActionError(null)
    try {
      await contratosApi.atribuirMotorista(agendamentoId, motoristaId)
      await load()
    } catch (err) {
      setActionError(readApiError(err))
    } finally {
      setAtribuindoId(null)
    }
  }

  const confirmarAnular = async () => {
    if (!contrato) return
    setBusy(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      await contratosApi.anularContrato(contrato.id, motivoAnular.trim() || undefined)
      setActionSuccess('Contrato anulado com sucesso.')
      setAnularOpen(false)
      setMotivoAnular('')
      await load()
    } catch (err) {
      setActionError(readApiError(err))
    } finally {
      setBusy(false)
    }
  }

  const agendamentoAReagendar = contrato?.agendamentos?.find((a) => a.id === reagendarAgendamentoId) ?? null

  const confirmarReagendar = async () => {
    if (reagendarAgendamentoId === null) return
    setActionError(null)
    setActionSuccess(null)
    try {
      await contratosApi.reagendarAgendamento(reagendarAgendamentoId, novaDataRecolha)
      setActionSuccess('Recolha reagendada com sucesso.')
      setReagendarAgendamentoId(null)
      await load()
    } catch (err) {
      setActionError(readApiError(err))
    }
  }

  return (
    <Box>
      <PageHeader
        title={contrato ? `Contrato #${contrato.id}` : 'Contrato'}
        subtitle="Detalhes completos do contrato de recolha"
        actions={
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/contratos')} variant="outlined">
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
        <>
          <Tabs value={tab} onChange={(_e, v: number) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Detalhes" />
            <Tab label={`Mensalidades (${contrato.parcelas?.length ?? 0})`} />
            <Tab label={`Agendamentos (${contrato.agendamentos?.length ?? 0})`} />
          </Tabs>

          {tab === 0 && (
            <Card elevation={0} sx={{ p: 3 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Ficha do contrato</Typography>
                <Chip label={ESTADO_CONTRATO_LABEL[contrato.estado]} color={ESTADO_CONTRATO_COLOR[contrato.estado]} />
              </Stack>

              <Stack spacing={1.5}>
                <InfoRow label="Cliente" value={`${contrato.cliente?.nome ?? '—'} (${contrato.cliente?.email ?? '—'})`} />
                <InfoRow label="Telefone" value={contrato.cliente?.telefone ?? '—'} />
                <InfoRow
                  label="Localização"
                  value={
                    [
                      contrato.distrito?.municipio?.provincia?.nome,
                      contrato.distrito?.municipio?.nome,
                      contrato.distrito?.nome,
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'
                  }
                />
                <InfoRow label="Tipo de resíduo" value={contrato.tipoResiduo?.nome ?? '—'} />
                <InfoRow
                  label="Dias de recolha"
                  value={(contrato.diasSemana ?? []).map((d) => nomeDiaSemana(d.dia_semana)).join(', ')}
                />
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

              {actionError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {actionError}
                </Alert>
              )}
              {actionSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {actionSuccess}
                </Alert>
              )}
              {(contrato.estado === 'pendente' || contrato.estado === 'aprovado') && (
                <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                  {contrato.estado === 'pendente' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<Check />}
                      disabled={busy}
                      onClick={() => void runAction('aprovar')}
                    >
                      Aprovar
                    </Button>
                  )}
                  {contrato.estado === 'pendente' && (
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<Close />}
                      disabled={busy}
                      onClick={() => void runAction('rejeitar')}
                    >
                      Rejeitar
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Block />}
                    disabled={busy}
                    onClick={() => {
                      setMotivoAnular('')
                      setAnularOpen(true)
                    }}
                  >
                    Anular contrato
                  </Button>
                </Stack>
              )}
            </Card>
          )}

          {tab === 1 && (
            <Card elevation={0} sx={{ p: 0 }}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h6">Mensalidades</Typography>
              </Box>
              {actionError && (
                <Alert severity="error" sx={{ mx: 2.5, mb: 2 }}>
                  {actionError}
                </Alert>
              )}
              {actionSuccess && (
                <Alert severity="success" sx={{ mx: 2.5, mb: 2 }}>
                  {actionSuccess}
                </Alert>
              )}
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
                        <TableCell>Pago em</TableCell>
                        <TableCell>Liquidado por</TableCell>
                        <TableCell>Recibo</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contrato.parcelas
                        .slice(parcelaPage * 10, parcelaPage * 10 + 10)
                        .map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{p.numero_parcela}</TableCell>
                            <TableCell>{formatData(p.data_vencimento)}</TableCell>
                            <TableCell align="right">{formatMoeda(p.valor)}</TableCell>
                            <TableCell>
                              <Chip size="small" label={PARCELA_ESTADO[p.estado].label} color={PARCELA_ESTADO[p.estado].color} />
                            </TableCell>
                            <TableCell>{formatData(p.data_pagamento)}</TableCell>
                            <TableCell>{p.registadoPor?.nome ?? '—'}</TableCell>
                            <TableCell>{p.numero_recibo ?? '—'}</TableCell>
                            <TableCell align="right">
                              {p.estado === 'pendente' ? (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<Check />}
                                  disabled={liquidandoId !== null}
                                  onClick={() => setConfirmarLiquidacaoId(p.id)}
                                >
                                  Liquidar
                                </Button>
                              ) : p.estado === 'pago' ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Receipt />}
                                  disabled={aDescarregarReciboId !== null}
                                  onClick={() => void descarregarRecibo(p)}
                                >
                                  Recibo
                                </Button>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={contrato.parcelas.length}
                    rowsPerPage={10}
                    rowsPerPageOptions={[10]}
                    page={parcelaPage}
                    onPageChange={(_e, page) => setParcelaPage(page)}
                  />
                </TableContainer>
              )}
            </Card>
          )}

          {tab === 2 && (
            <Card elevation={0} sx={{ p: 0 }}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h6">Agendamentos</Typography>
              </Box>
              {actionError && (
                <Alert severity="error" sx={{ mx: 2.5, mb: 2 }}>
                  {actionError}
                </Alert>
              )}
              {actionSuccess && (
                <Alert severity="success" sx={{ mx: 2.5, mb: 2 }}>
                  {actionSuccess}
                </Alert>
              )}
              {!contrato.agendamentos || contrato.agendamentos.length === 0 ? (
                <EmptyState message="Sem recolhas agendadas." />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Motorista</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Observação</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contrato.agendamentos
                        .slice(agendamentoPage * 10, agendamentoPage * 10 + 10)
                        .map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>
                              {formatData(a.data_recolha)}
                              {a.data_recolha_anterior && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  Ajustado de {formatData(a.data_recolha_anterior)}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {a.estado === 'pendente' ? (
                                <Select
                                  size="small"
                                  fullWidth
                                  value={String(a.motorista_id ?? '')}
                                  disabled={atribuindoId !== null}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? null : Number(e.target.value)
                                    void atribuirMotorista(a.id, value)
                                  }}
                                  sx={{ minWidth: 160 }}
                                >
                                  <MenuItem value="">Não atribuído</MenuItem>
                                  {motoristas.map((m) => (
                                    <MenuItem key={m.id} value={String(m.id)}>
                                      {m.utilizador?.nome ?? `#${m.id}`}
                                    </MenuItem>
                                  ))}
                                </Select>
                              ) : (
                                a.motorista?.utilizador?.nome ?? 'Não atribuído'
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={AGENDAMENTO_ESTADO[a.estado].label} color={AGENDAMENTO_ESTADO[a.estado].color} />
                            </TableCell>
                            <TableCell>{a.observacao ?? '—'}</TableCell>
                            <TableCell align="right">
                              {a.estado === 'pendente' ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Event />}
                                  disabled={reagendarAgendamentoId !== null}
                                  onClick={() => {
                                    setNovaDataRecolha(a.data_recolha.slice(0, 16))
                                    setReagendarAgendamentoId(a.id)
                                  }}
                                >
                                  Reagendar
                                </Button>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={contrato.agendamentos.length}
                    rowsPerPage={10}
                    rowsPerPageOptions={[10]}
                    page={agendamentoPage}
                    onPageChange={(_e, page) => setAgendamentoPage(page)}
                  />
                </TableContainer>
              )}
            </Card>
          )}
        </>
      )}

      <Dialog
        open={confirmarLiquidacaoId !== null}
        onClose={() => setConfirmarLiquidacaoId(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tem a certeza?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Deseja liquidar a prestação <strong>Parcela {parcelaEmLiquidacao?.numero_parcela}</strong> do contrato{' '}
            <strong>#{contrato?.id ?? '—'}</strong>?
          </Typography>
          {parcelaEmLiquidacao && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Valor: {formatMoeda(parcelaEmLiquidacao.valor)} · Vencimento: {formatData(parcelaEmLiquidacao.data_vencimento)}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Após confirmar, a prestação passa a <strong>paga</strong> e é gerado o recibo correspondente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setConfirmarLiquidacaoId(null)} variant="outlined" disabled={liquidandoId !== null}>
            Cancelar
          </Button>
          <Button
            onClick={() => void confirmarLiquidacao()}
            variant="contained"
            color="success"
            startIcon={<Check />}
            disabled={liquidandoId !== null}
          >
            Liquidar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={anularOpen} onClose={() => setAnularOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Anular contrato #{contrato?.id ?? '—'}?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Esta ação elimina o contrato e cancela <strong>todas as recolhas pendentes</strong> e{' '}
            <strong>mensalidades em aberto</strong>. As mensalidades já pagas e o histórico são mantidos.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Motivo (opcional)"
            placeholder="Ex.: cliente desistiu do serviço"
            value={motivoAnular}
            onChange={(e) => setMotivoAnular(e.target.value)}
            sx={{ mt: 2 }}
            multiline
            minRows={2}
            maxRows={4}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setAnularOpen(false)} variant="outlined" disabled={busy}>
            Cancelar
          </Button>
          <Button
            onClick={() => void confirmarAnular()}
            variant="contained"
            color="error"
            startIcon={<Block />}
            disabled={busy}
          >
            Anular contrato
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reagendarAgendamentoId !== null} onClose={() => setReagendarAgendamentoId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reagendar recolha</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Recolha atual: <strong>{formatData(agendamentoAReagendar?.data_recolha ?? '')}</strong>
            {agendamentoAReagendar?.motorista?.utilizador?.nome &&
              ` · Motorista: ${agendamentoAReagendar.motorista.utilizador.nome}`}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Nova data e hora"
            type="datetime-local"
            value={novaDataRecolha}
            onChange={(e) => setNovaDataRecolha(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            A nova data deve ser futura, num dia com recolha disponível para o distrito do contrato.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setReagendarAgendamentoId(null)} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={() => void confirmarReagendar()}
            variant="contained"
            startIcon={<Event />}
            disabled={!novaDataRecolha}
          >
            Reagendar
          </Button>
        </DialogActions>
      </Dialog>
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
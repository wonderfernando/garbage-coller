import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Avatar,
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
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import {
  ArrowBack,
  AssignmentOutlined,
  BadgeOutlined,
  Block,
  CalendarToday,
  CheckCircleOutlined,
  EventAvailable,
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@mui/icons-material'
import { administracaoApi } from '../../api/administracao'
import { readApiError } from '../../api/client'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView'
import { colors } from '../../theme'
import {
  ESTADO_CONTRATO_LABEL,
  formatData,
  formatMoeda,
  nomeDiaSemana,
} from '../../types'
import type { AgendamentoRecolha, Contrato, User } from '../../types'

const TIPO_CLIENTE_LABEL: Record<string, string> = {
  particular: 'Particular',
  empresa: 'Empresa',
}

const AGENDAMENTO_ESTADO: Record<AgendamentoRecolha['estado'], { label: string; color: 'default' | 'success' | 'error' | 'warning' }> = {
  pendente: { label: 'Pendente', color: 'warning' },
  concluido: { label: 'Concluído', color: 'success' },
  cancelado: { label: 'Cancelado', color: 'error' },
}

const ESTADO_CONTRATO_COLOR: Record<Contrato['estado'], 'default' | 'success' | 'error' | 'warning'> = {
  pendente: 'warning',
  aprovado: 'success',
  rejeitado: 'error',
  cancelado: 'default',
}

function formatDataHora(data?: string | null): string {
  if (!data) return '—'
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

export default function ClientePerfilPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const clienteId = Number(id)

  const [cliente, setCliente] = useState<User | null>(null)
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [agendamentos, setAgendamentos] = useState<AgendamentoRecolha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState(0)

  const [blockOpen, setBlockOpen] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [blocking, setBlocking] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [c, cs, ags] = await Promise.all([
        administracaoApi.getCliente(clienteId),
        administracaoApi.listarContratosCliente(clienteId),
        administracaoApi.listarAgendamentosCliente(clienteId),
      ])
      setCliente(c)
      setContratos(cs)
      setAgendamentos(ags)
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [clienteId])

  useEffect(() => {
    void load()
  }, [load])

  const openBlockModal = () => {
    setMotivo('')
    setActionError(null)
    setBlockOpen(true)
  }

  const confirmBlock = async () => {
    if (!cliente) return
    setBlocking(true)
    setActionError(null)
    try {
      const res = await administracaoApi.bloquearCliente(cliente.id, motivo)
      setCliente(res.user)
      setBlockOpen(false)
    } catch (err) {
      setActionError(readApiError(err))
    } finally {
      setBlocking(false)
    }
  }

  const confirmUnblock = async () => {
    if (!cliente) return
    setBlocking(true)
    setActionError(null)
    try {
      const res = await administracaoApi.desbloquearCliente(cliente.id)
      setCliente(res.user)
    } catch (err) {
      setActionError(readApiError(err))
    } finally {
      setBlocking(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!cliente) {
    return <ErrorState message="Cliente não encontrado." onRetry={() => void load()} />
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
        <Button startIcon={<ArrowBack />} size="small" onClick={() => navigate('/clientes')}>
          Voltar
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_e, v: number) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Perfil" />
        <Tab label={`Contratos (${contratos.length})`} />
        <Tab label={`Agendamentos (${agendamentos.length})`} />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          {actionError && <Alert severity="error">{actionError}</Alert>}

          {cliente.bloqueado && (
            <Alert severity="error" icon={<Block />}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Conta bloqueada
              </Typography>
              <Typography variant="body2">{cliente.motivo_bloqueio ?? 'Sem motivo registado.'}</Typography>
            </Alert>
          )}

          <Card elevation={0}>
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Avatar
                  sx={{ width: 64, height: 64, bgcolor: colors.green[800], fontSize: 28, fontWeight: 600 }}
                >
                  {cliente.nome.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6">{cliente.nome}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={cliente.tipo_cliente === 'empresa' ? 'primary' : 'default'}
                      label={TIPO_CLIENTE_LABEL[cliente.tipo_cliente ?? ''] ?? cliente.tipo_cliente ?? '—'}
                    />
                    {cliente.bloqueado ? (
                      <Chip size="small" label="Bloqueado" color="error" />
                    ) : (
                      <Chip size="small" variant="outlined" label="Ativo" color="success" />
                    )}
                  </Stack>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem icon={<MailOutlined />} label="Email" value={cliente.email} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem icon={<PhoneOutlined />} label="Telefone" value={cliente.telefone ?? '—'} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem icon={<BadgeOutlined />} label="NIF" value={cliente.nif ?? '—'} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem icon={<CalendarToday />} label="Registado em" value={formatData(cliente.created_at)} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoItem icon={<HomeOutlined />} label="Endereço principal" value={cliente.endereco_principal ?? '—'} />
                </Grid>
              </Grid>
            </Box>
          </Card>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard
                icon={<AssignmentOutlined />}
                label="Contratos"
                value={cliente.contratos_count ?? 0}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard icon={<EventAvailable />} label="Agendamentos" value={agendamentos.length} />
            </Grid>
          </Grid>

          <Box sx={{ pt: 1 }}>
            {cliente.bloqueado ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlined />}
                onClick={() => void confirmUnblock()}
                disabled={blocking}
              >
                {blocking ? 'A processar...' : 'Desbloquear cliente'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                startIcon={<Block />}
                onClick={openBlockModal}
              >
                Bloquear cliente
              </Button>
            )}
          </Box>
        </Stack>
      )}

      {tab === 1 && (
        <Card elevation={0}>
          {contratos.length === 0 ? (
            <EmptyState message="Este cliente ainda não tem contratos." />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Distrito</TableCell>
                    <TableCell>Tipo de resíduo</TableCell>
                    <TableCell align="right">Valor mensal</TableCell>
                    <TableCell>Dias</TableCell>
                    <TableCell>Duração</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contratos.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.distrito?.nome ?? `#${c.distrito_id}`}</TableCell>
                      <TableCell>{c.tipoResiduo?.nome ?? '—'}</TableCell>
                      <TableCell align="right">{formatMoeda(c.valor_mensal)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                          {(c.diasSemana ?? []).map((d) => (
                            <Chip key={d.id} size="small" label={nomeDiaSemana(d.dia_semana)} />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>{c.duracao_meses} meses</TableCell>
                      <TableCell>
                        <Chip size="small" label={ESTADO_CONTRATO_LABEL[c.estado]} color={ESTADO_CONTRATO_COLOR[c.estado]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {tab === 2 && (
        <Card elevation={0}>
          {agendamentos.length === 0 ? (
            <EmptyState message="Este cliente ainda não tem agendamentos." />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Distrito</TableCell>
                    <TableCell>Rua</TableCell>
                    <TableCell>Motorista</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Observação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agendamentos.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{formatDataHora(a.data_recolha)}</TableCell>
                      <TableCell>{a.contrato?.distrito?.nome ?? `#${a.contrato_id}`}</TableCell>
                      <TableCell>{a.contrato?.rua ?? '—'}</TableCell>
                      <TableCell>{a.motorista?.utilizador?.nome ?? 'Não atribuído'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={AGENDAMENTO_ESTADO[a.estado].label} color={AGENDAMENTO_ESTADO[a.estado].color} />
                      </TableCell>
                      <TableCell>{a.observacao ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      <Dialog open={blockOpen} onClose={() => setBlockOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bloquear cliente</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {actionError && <Alert severity="error">{actionError}</Alert>}
            <Typography variant="body2" color="text.secondary">
              O cliente ficará impossibilitado de iniciar sessão até ser desbloqueado. Indique o motivo do bloqueio.
            </Typography>
            <TextField
              label="Motivo do bloqueio"
              multiline
              minRows={3}
              fullWidth
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              error={actionError !== null}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockOpen(false)} disabled={blocking}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Block />}
            onClick={() => void confirmBlock()}
            disabled={blocking || motivo.trim().length < 5}
          >
            {blocking ? 'A bloquear...' : 'Confirmar bloqueio'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ mt: 0.25, color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  )
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <Card elevation={0}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
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
        <Box>
          <Typography variant="h6">{value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}

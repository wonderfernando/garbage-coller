import { useState } from 'react'
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
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { CategoryOutlined, CheckCircleOutlined, CancelOutlined, LocationOnOutlined, PlaceOutlined } from '@mui/icons-material'
import type { AgendamentoRecolha } from '../../types'
import { EmptyState } from '../../components/StateView'
import { formatData, nomeDiaSemana } from '../../types'
import { colors } from '../../theme'

const AGENDAMENTO_ESTADO: Record<
  AgendamentoRecolha['estado'],
  { label: string; color: 'default' | 'success' | 'error' | 'warning' }
> = {
  pendente: { label: 'Pendente', color: 'warning' },
  concluido: { label: 'Concluído', color: 'success' },
  cancelado: { label: 'Cancelado', color: 'error' },
}

interface RecolhaListProps {
  recolhas: AgendamentoRecolha[]
  busyId: number | null
  onConcluir: (id: number) => void | Promise<void>
  onCancelar: (id: number, observacao: string) => void | Promise<void>
  emptyMessage: string
}

export default function RecolhaList({ recolhas, busyId, onConcluir, onCancelar, emptyMessage }: RecolhaListProps) {
  const [concluirId, setConcluirId] = useState<number | null>(null)
  const [cancelarId, setCancelarId] = useState<number | null>(null)
  const [observacao, setObservacao] = useState('')
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (recolhas.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  const confirmConcluir = async () => {
    if (concluirId === null) return
    setSaving(true)
    setDialogError(null)
    try {
      await onConcluir(concluirId)
      setConcluirId(null)
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : 'Não foi possível concluir a recolha.')
    } finally {
      setSaving(false)
    }
  }

  const openCancelar = (id: number) => {
    setObservacao('')
    setDialogError(null)
    setCancelarId(id)
  }

  const confirmCancelar = async () => {
    if (cancelarId === null) return
    setSaving(true)
    setDialogError(null)
    try {
      await onCancelar(cancelarId, observacao)
      setCancelarId(null)
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : 'Não foi possível cancelar a recolha.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Stack spacing={1.5} sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        {recolhas.map((a) => {
          const pendente = a.estado === 'pendente'
          const data = new Date(a.data_recolha)
          const diaSemana = Number.isNaN(data.getTime()) ? null : data.getDay()
          return (
            <Card key={a.id} elevation={0} sx={{ p: 2 }}>
              <Stack spacing={1.25}>
                <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Stack>
                    <Typography variant="h6" sx={{ fontSize: '1.4rem', lineHeight: 1, color: colors.green[800] }}>
                      {formatHora(a.data_recolha)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {diaSemana !== null ? `${nomeDiaSemana(diaSemana)} · ${formatData(a.data_recolha)}` : formatData(a.data_recolha)}
                    </Typography>
                  </Stack>
                  <Chip size="small" label={AGENDAMENTO_ESTADO[a.estado].label} color={AGENDAMENTO_ESTADO[a.estado].color} />
                </Stack>

                <Divider />

                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {a.contrato?.cliente?.nome ?? 'Cliente não identificado'}
                </Typography>

                <Stack spacing={0.75}>
                  <InfoRow icon={<PlaceOutlined />} text={a.contrato?.distrito?.nome ?? `#${a.contrato_id}`} />
                  <InfoRow icon={<CategoryOutlined />} text={a.contrato?.tipoResiduo?.nome ?? '—'} />
                  <InfoRow icon={<LocationOnOutlined />} text={a.contrato?.rua ?? 'Rua não indicada'} />
                </Stack>

                {pendente && (
                  <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleOutlined />}
                      disabled={busyId === a.id}
                      onClick={() => setConcluirId(a.id)}
                      sx={{ py: 1.25 }}
                    >
                      Concluir
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<CancelOutlined />}
                      disabled={busyId === a.id}
                      onClick={() => openCancelar(a.id)}
                      sx={{ py: 1.25 }}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Card>
          )
        })}
      </Stack>

      <Dialog open={concluirId !== null} onClose={() => setConcluirId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Concluir recolha</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dialogError}
              </Alert>
            )}
            <Typography variant="body2">Confirma que esta recolha foi concluída?</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConcluirId(null)} disabled={saving}>
            Voltar
          </Button>
          <Button variant="contained" color="success" onClick={() => void confirmConcluir()} disabled={saving}>
            {saving ? 'A guardar...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cancelarId !== null} onClose={() => setCancelarId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancelar recolha</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}
            <Typography variant="body2" color="text.secondary">
              Ao cancelar a recolha é obrigatório indicar o motivo.
            </Typography>
            <TextField
              label="Motivo do cancelamento"
              multiline
              minRows={3}
              fullWidth
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              error={!!dialogError && !observacao.trim()}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelarId(null)} disabled={saving}>
            Voltar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void confirmCancelar()}
            disabled={saving || observacao.trim().length === 0}
          >
            {saving ? 'A guardar...' : 'Confirmar cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
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
import { useCallback, useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { Add, Delete, Edit } from '@mui/icons-material'
import { administracaoApi } from '../../api/administracao'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { EmptyState, LoadingState } from '../../components/StateView'
import type { Motorista, Veiculo } from '../../types'

const schema = z.object({
  matricula: z.string().min(1, 'Informe a matrícula.'),
  modelo: z.string().optional(),
  motorista_id: z.union([z.number(), z.undefined()]),
})

type FormValues = z.infer<typeof schema>

interface FormState {
  open: boolean
  editing?: Veiculo
}

const SEM_MOTORISTA = ''

export default function VeiculosPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({ open: false })
  const [confirmDelete, setConfirmDelete] = useState<Veiculo | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [v, m] = await Promise.all([
        administracaoApi.listarVeiculos(),
        administracaoApi.listarMotoristas(),
      ])
      setVeiculos(v)
      setMotoristas(m)
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const openCreate = () => {
    setFormError(null)
    reset({ matricula: '', modelo: '', motorista_id: undefined })
    setForm({ open: true })
  }

  const openEdit = (v: Veiculo) => {
    setFormError(null)
    reset({ matricula: v.matricula, modelo: v.modelo ?? '', motorista_id: v.motorista_id ?? undefined })
    setForm({ open: true, editing: v })
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setFormError(null)
    const payload = {
      matricula: values.matricula,
      modelo: values.modelo || undefined,
      motorista_id: values.motorista_id ?? null,
    }
    try {
      if (form.editing) {
        await administracaoApi.atualizarVeiculo(form.editing.id, payload)
      } else {
        await administracaoApi.criarVeiculo(payload)
      }
      setForm({ open: false })
      await load()
    } catch (err) {
      setFormError(readApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async () => {
    if (!confirmDelete) return
    setError(null)
    try {
      await administracaoApi.eliminarVeiculo(confirmDelete.id)
      setConfirmDelete(null)
      await load()
    } catch (err) {
      setError(readApiError(err))
      setConfirmDelete(null)
    }
  }

  const motoristaNome = (v: Veiculo) => v.motorista?.utilizador?.nome

  return (
    <Box>
      <PageHeader
        title="Veículos"
        subtitle="Gerir a frota e alocar veículos a motoristas"
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Novo veículo
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingState />
      ) : veiculos.length === 0 ? (
        <Card elevation={0}>
          <EmptyState message="Ainda não existem veículos na frota." />
        </Card>
      ) : (
        <Card elevation={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Modelo</TableCell>
                  <TableCell>Motorista</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {veiculos.map((v) => (
                  <TableRow key={v.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {v.matricula}
                      </Typography>
                    </TableCell>
                    <TableCell>{v.modelo || '—'}</TableCell>
                    <TableCell>{motoristaNome(v) || '—'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Button size="small" startIcon={<Edit />} onClick={() => openEdit(v)}>
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => setConfirmDelete(v)}
                        >
                          Eliminar
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={form.open} onClose={() => setForm({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>{form.editing ? 'Editar veículo' : 'Novo veículo'}</DialogTitle>
        <Box
          component="form"
          onSubmit={handleSubmit((values) => {
            if ('motorista_id' in values) void onSubmit(values)
          })}
        >
          <DialogContent>
            <Stack spacing={2}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <TextField
                label="Matrícula"
                fullWidth
                {...register('matricula')}
                error={Boolean(errors.matricula)}
                helperText={errors.matricula?.message}
              />
              <TextField
                label="Modelo"
                fullWidth
                {...register('modelo')}
                error={Boolean(errors.modelo)}
                helperText={errors.modelo?.message}
              />
              <TextField
                select
                label="Motorista"
                fullWidth
                value={form.editing?.motorista_id ?? SEM_MOTORISTA}
                onChange={(e) =>
                  setValue(
                    'motorista_id',
                    e.target.value === SEM_MOTORISTA ? undefined : Number(e.target.value),
                  )
                }
              >
                <MenuItem value={SEM_MOTORISTA}>Sem motorista</MenuItem>
                {motoristas.map((m) => (
                  <MenuItem key={m.id} value={m.id as never}>
                    {m.utilizador?.nome ?? `#${m.id}`}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setForm({ open: false })}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {form.editing ? 'Guardar' : 'Criar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Eliminar veículo</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Eliminar o veículo de matrícula <strong>{confirmDelete?.matricula}</strong>? Esta ação é
            irreversível.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={() => void onDelete()}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
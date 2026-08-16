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
import { formatMoeda } from '../../types'
import type { TipoResiduo } from '../../types'

const schema = z.object({
  nome: z.string().min(1, 'Informe a designação.'),
  descricao: z.string().min(1, 'Informe a descrição.'),
  preco_unitario_recolha: z.coerce.number().positive('O preço tem de ser positivo.'),
  taxa_adesao: z.coerce.number().min(0, 'A taxa não pode ser negativa.'),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

interface FormState {
  open: boolean
  editing?: TipoResiduo
}

export default function TiposResiduosPage() {
  const [items, setItems] = useState<TipoResiduo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({ open: false })
  const [confirmDelete, setConfirmDelete] = useState<TipoResiduo | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await administracaoApi.listarTiposResiduos())
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
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema) })

  const openCreate = () => {
    setFormError(null)
    reset({ nome: '', descricao: '', preco_unitario_recolha: 0, taxa_adesao: 0 })
    setForm({ open: true })
  }

  const openEdit = (item: TipoResiduo) => {
    setFormError(null)
    reset({
      nome: item.nome,
      descricao: item.descricao,
      preco_unitario_recolha: item.preco_unitario_recolha,
      taxa_adesao: item.taxa_adesao,
    })
    setForm({ open: true, editing: item })
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setFormError(null)
    try {
      if (form.editing) {
        await administracaoApi.atualizarTipoResiduo(form.editing.id, values)
      } else {
        await administracaoApi.criarTipoResiduo(values)
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
    setSubmitting(true)
    setError(null)
    try {
      await administracaoApi.eliminarTipoResiduo(confirmDelete.id)
      setConfirmDelete(null)
      await load()
    } catch (err) {
      setError(readApiError(err))
      setConfirmDelete(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <PageHeader
        title="Tipos de resíduos"
        subtitle="Gerir tipos de resíduos, preços unitários e taxas de adesão"
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Novo tipo de resíduo
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
      ) : items.length === 0 ? (
        <Card elevation={0}>
          <EmptyState message="Ainda não existem tipos de resíduos." />
        </Card>
      ) : (
        <Card elevation={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Designação</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Preço unitário</TableCell>
                  <TableCell align="right">Taxa de adesão</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell align="right">{formatMoeda(item.preco_unitario_recolha)}</TableCell>
                    <TableCell align="right">{formatMoeda(item.taxa_adesao)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => openEdit(item)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => setConfirmDelete(item)}
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
        <DialogTitle>{form.editing ? 'Editar tipo de resíduo' : 'Novo tipo de resíduo'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <TextField
                label="Designação"
                fullWidth
                {...register('nome')}
                error={Boolean(errors.nome)}
                helperText={errors.nome?.message}
              />
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={2}
                {...register('descricao')}
                error={Boolean(errors.descricao)}
                helperText={errors.descricao?.message}
              />
              <TextField
                label="Preço unitário de recolha (AOA)"
                type="number"
                fullWidth
                {...register('preco_unitario_recolha')}
                error={Boolean(errors.preco_unitario_recolha)}
                helperText={errors.preco_unitario_recolha?.message}
              />
              <TextField
                label="Taxa de adesão (AOA)"
                type="number"
                fullWidth
                {...register('taxa_adesao')}
                error={Boolean(errors.taxa_adesao)}
                helperText={errors.taxa_adesao?.message}
              />
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
        <DialogTitle>Eliminar tipo de resíduo</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Tem a certeza que pretende eliminar <strong>{confirmDelete?.nome}</strong>? Esta ação é
            irreversível.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={() => void onDelete()} disabled={submitting}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
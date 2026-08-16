import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { PersonAdd } from '@mui/icons-material'
import { administracaoApi } from '../../api/administracao'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import type { User } from '../../types'
import { formatData } from '../../types'

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'motorista', label: 'Motorista' },
]

type FiltroRole = 'todos' | 'admin' | 'motorista'

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  cliente: 'Cliente',
  motorista: 'Motorista',
}

const schema = z
  .object({
    nome: z.string().min(1, 'Informe o nome.'),
    email: z.string().min(1, 'Informe o email.').email('Email inválido.'),
    telefone: z.string().min(1, 'Informe o telefone.'),
    password: z.string().min(8, 'A palavra-passe tem de ter pelo menos 8 caracteres.'),
    role: z.enum(['admin', 'motorista']),
    numero_carta: z.string().optional(),
  })
  .refine((v) => v.role === 'motorista' ? Boolean(v.numero_carta?.trim()) : true, {
    path: ['numero_carta'],
    message: 'O número de carta é obrigatório para motoristas.',
  })

type FormValues = z.infer<typeof schema>

const emptyForm: FormValues = {
  nome: '',
  email: '',
  telefone: '',
  password: '',
  role: 'admin',
  numero_carta: '',
}

export default function UtilizadoresPage() {
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [filtro, setFiltro] = useState<FiltroRole>(
    initialRole === 'admin' || initialRole === 'motorista' ? initialRole : 'todos',
  )
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm,
  })

  const role = watch('role')

  const loadUsers = useCallback(async (role?: 'admin' | 'motorista') => {
    setLoading(true)
    setListError(null)
    try {
      setUsers(await administracaoApi.listarUtilizadores(role))
    } catch (err) {
      setListError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers(filtro === 'todos' ? undefined : filtro)
  }, [loadUsers, filtro])

  const openModal = () => {
    setError(null)
    setSuccess(null)
    reset(emptyForm)
    setModalOpen(true)
  }

  const closeModal = () => {
    if (submitting) return
    setModalOpen(false)
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      await administracaoApi.criarUtilizador({
        nome: values.nome,
        email: values.email,
        telefone: values.telefone,
        password: values.password,
        role: values.role,
        numero_carta: values.role === 'motorista' ? values.numero_carta : undefined,
      })
      setSuccess('Conta criada com sucesso.')
      reset(emptyForm)
      await loadUsers(filtro === 'todos' ? undefined : filtro)
      setTimeout(() => setModalOpen(false), 700)
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box>
      <PageHeader
        title="Utilizadores"
        subtitle="Gerir contas de administrador e de motorista"
        actions={
          <Button variant="contained" startIcon={<PersonAdd />} onClick={openModal}>
            Novo utilizador
          </Button>
        }
      />

      {listError && <Alert severity="error" sx={{ mb: 2 }}>{listError}</Alert>}

      <ToggleButtonGroup
        exclusive
        size="small"
        value={filtro}
        onChange={(_e, value: FiltroRole | null) => {
          if (value) setFiltro(value)
        }}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="todos">Todos</ToggleButton>
        <ToggleButton value="motorista">Motoristas</ToggleButton>
        <ToggleButton value="admin">Administradores</ToggleButton>
      </ToggleButtonGroup>

      <Paper elevation={0} sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Criado em</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      Nenhum utilizador registado ainda.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.telefone ?? '—'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={roleLabel[user.role] ?? user.role}
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatData(user.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>Novo utilizador</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}

              <TextField
                label="Nome completo"
                fullWidth
                {...register('nome')}
                error={Boolean(errors.nome)}
                helperText={errors.nome?.message}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                {...register('email')}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />
              <TextField
                label="Telefone"
                fullWidth
                {...register('telefone')}
                error={Boolean(errors.telefone)}
                helperText={errors.telefone?.message}
              />
              <TextField
                label="Palavra-passe"
                type="password"
                fullWidth
                {...register('password')}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />
              <TextField
                select
                label="Perfil"
                fullWidth
                {...register('role')}
                error={Boolean(errors.role)}
                helperText={errors.role?.message}
              >
                {roleOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value as never}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>

              {role === 'motorista' && (
                <TextField
                  label="Número de carta"
                  fullWidth
                  {...register('numero_carta')}
                  error={Boolean(errors.numero_carta)}
                  helperText={errors.numero_carta?.message}
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<PersonAdd />}
              disabled={submitting}
            >
              {submitting ? 'A criar...' : 'Criar conta'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}

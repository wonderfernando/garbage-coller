import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { readApiError } from '../api/client'

const registoSchema = z
  .object({
    nome: z.string().min(2, 'Informe o seu nome completo.'),
    email: z.string().min(1, 'Informe o email.').email('Email inválido.'),
    telefone: z.string().min(6, 'Informe um telefone válido.'),
    tipo_cliente: z.enum(['particular', 'empresa'], { message: 'Selecione o tipo de cliente.' }),
    nif: z.string().optional(),
    endereco_principal: z.string().optional(),
    password: z.string().min(8, 'A palavra-passe deve ter pelo menos 8 caracteres.'),
    confirmacao: z.string().min(1, 'Confirme a palavra-passe.'),
  })
  .refine((d) => d.password === d.confirmacao, {
    path: ['confirmacao'],
    message: 'As palavras-passe não coincidem.',
  })

type RegistoForm = z.infer<typeof registoSchema>

export default function RegistoPage() {
  const { registar } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistoForm>({
    resolver: zodResolver(registoSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      tipo_cliente: 'particular',
      nif: '',
      endereco_principal: '',
      password: '',
      confirmacao: '',
    },
  })

  const onSubmit = async (values: RegistoForm) => {
    setSubmitting(true)
    setError(null)
    try {
      await registar({
        nome: values.nome,
        email: values.email,
        telefone: values.telefone,
        tipo_cliente: values.tipo_cliente,
        nif: values.nif || undefined,
        endereco_principal: values.endereco_principal || undefined,
        password: values.password,
      })
      navigate('/cliente', { replace: true })
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper elevation={2} sx={{ width: '100%', maxWidth: 480, p: { xs: 3, sm: 4 }, borderRadius: 0.5 }}>
        <Stack sx={{ mb: 4 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600, textAlign: 'center' }}>
            ELISAL-EP
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
            Crie a sua conta de cliente
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

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
              label="Tipo de cliente"
              select
              fullWidth
              {...register('tipo_cliente')}
              error={Boolean(errors.tipo_cliente)}
              helperText={errors.tipo_cliente?.message}
            >
              <MenuItem value="particular">Particular</MenuItem>
              <MenuItem value="empresa">Empresa</MenuItem>
            </TextField>

            <TextField
              label="NIF (opcional)"
              fullWidth
              {...register('nif')}
              error={Boolean(errors.nif)}
              helperText={errors.nif?.message}
            />

            <TextField
              label="Endereço principal (opcional)"
              fullWidth
              {...register('endereco_principal')}
              error={Boolean(errors.endereco_principal)}
              helperText={errors.endereco_principal?.message}
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
              label="Confirmar palavra-passe"
              type="password"
              fullWidth
              {...register('confirmacao')}
              error={Boolean(errors.confirmacao)}
              helperText={errors.confirmacao?.message}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
            >
              Criar conta
            </Button>
          </Stack>

          <Stack sx={{ mt: 3, alignItems: 'center', flexDirection: 'row', gap: 0.5, justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Já tem conta?
            </Typography>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0b4a2e' }}>
                Iniciar sessão
              </Typography>
            </Link>
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}
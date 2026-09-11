import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useAuth } from '../../context/AuthContext'
import { readApiError } from '../../api/client'
import { roleHomePath } from '../RoleGuard'

export type LoginTipo = 'cliente' | 'funcionario'

const loginSchema = z.object({
  email: z.string().min(1, 'Informe o email.').email('Email inválido.'),
  password: z.string().min(1, 'Informe a palavra-passe.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const LABELS: Record<LoginTipo, { title: string; subtitle: string }> = {
  cliente: {
    title: 'Área do Cliente',
    subtitle: 'Acompanhe os seus contratos, agendamentos de recolha e o seu financeiro.',
  },
  funcionario: {
    title: 'Área Interna ELISAL',
    subtitle: 'Acesso reservado a administradores e motoristas.',
  },
}

export default function LoginForm({ tipo }: { tipo: LoginTipo }) {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true)
    setError(null)
    try {
      await login(values.email, values.password)
    } catch (err) {
      setError(readApiError(err))
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (user) {
      navigate(roleHomePath(user.role), { replace: true })
    }
  }, [user, navigate])

  const { title, subtitle } = LABELS[tipo]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(160deg, #06301f 0%, #0b4a2e 45%, #f0faf4 45%, #f0faf4 100%)',
      }}
    >
      <Paper elevation={2} sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 }, borderRadius: 0.5 }}>
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 6 }}>
          <img width={100} src="/logo.png" alt="ELISAL-EP" />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600, textAlign: 'center' }}>
            {title}
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary">
            {subtitle}
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              fullWidth
              {...register('email')}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />

            <TextField
              label="Palavra-passe"
              type="password"
              autoComplete="current-password"
              fullWidth
              {...register('password')}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
            >
              Entrar
            </Button>
          </Stack>

          {tipo === 'cliente' && (
            <Stack sx={{ mt: 3, alignItems: 'center', flexDirection: 'row', gap: 0.5, justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Ainda não tem conta?
              </Typography>
              <Link to="/registar" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0b4a2e' }}>
                  Criar conta
                </Typography>
              </Link>
            </Stack>
          )}
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f9259', display: 'inline-flex', alignItems: 'center' }}>
              <ArrowBackIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Voltar e escolher outro perfil
            </Typography>
          </Link>
        </Box>
      </Paper>
    </Box>
  )
}
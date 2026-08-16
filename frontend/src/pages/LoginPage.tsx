import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { readApiError } from '../api/client'

const loginSchema = z.object({
  email: z.string().min(1, 'Informe o email.').email('Email inválido.'),
  password: z.string().min(1, 'Informe a palavra-passe.'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginForm) => {
    setSubmitting(true)
    setError(null)
    try {
      await login(values.email, values.password)
      navigate('/', { replace: true })
    } catch (err) {
      console.log('Login error:', err)
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
      <Paper
         elevation={2}
        sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 }, borderRadius: 0.5,  }}
      >
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 6 }}>
          <Box
            sx={{
              borderRadius: 2,
               display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img width={100} src="./logo.png" className="w-4 h-4" />
            </Box>
          <Typography sx={{
            width: '100%',
            textAlign: 'center',
            fontWeight: 600,
          }} variant="h5" component="h1">
            ELISAL-EP
          </Typography>
          <Typography variant="body2" align='center' color="textDisabled">
            Insira as suas credencias pra iniciar a sessão
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
        </Box>
      </Paper>
    </Box>
  )
}
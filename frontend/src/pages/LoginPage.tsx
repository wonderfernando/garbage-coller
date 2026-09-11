import { Link } from 'react-router-dom'
import { Box, Button, Card, CardActionArea, Chip, Paper, Stack, Typography } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import BadgeIcon from '@mui/icons-material/Badge'

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: '#f0faf4',
      }}
    >
      <Paper elevation={2} sx={{ width: '100%', maxWidth: 520, p: { xs: 3, sm: 4 }, borderRadius: 0.5 }}>
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 4 }}>
          <img width={110} src="/logo.png" alt="ELISAL-EP" />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Iniciar sessão
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
            Selecione o seu perfil para continuar.
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Card elevation={0}>
            <CardActionArea component={Link} to="/login/cliente" sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ bgcolor: '#e2f2e9', borderRadius: 2, p: 1.5, display: 'flex' }}>
                  <PersonIcon sx={{ color: '#0b4a2e', fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Cliente
                    </Typography>
                    <Chip size="small" label="Recomendado" color="success" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Acompanhe os seus contratos, recolhas e pagamentos.
                  </Typography>
                </Box>
              </Stack>
            </CardActionArea>
          </Card>

          <Card elevation={0}>
            <CardActionArea component={Link} to="/login/funcionario" sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box sx={{ bgcolor: '#e2f2e9', borderRadius: 2, p: 1.5, display: 'flex' }}>
                  <BadgeIcon sx={{ color: '#0b4a2e', fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Funcionário ELISAL
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Administradores e motoristas.
                  </Typography>
                </Box>
              </Stack>
            </CardActionArea>
          </Card>
        </Stack>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Ainda não tem conta?
          </Typography>
          <Button component={Link} to="/registar" variant="outlined" fullWidth sx={{ mt: 1.5 }}>
            Criar conta de cliente
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
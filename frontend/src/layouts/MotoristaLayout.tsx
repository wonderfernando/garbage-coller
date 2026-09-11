import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Badge as BadgeIcon,
  EventAvailable as EventAvailableIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme'

const NAV = [
  { to: '/motorista', label: 'Hoje', icon: <HomeIcon /> },
  { to: '/motorista/cronograma', label: 'Cronograma', icon: <EventAvailableIcon /> },
]

export default function MotoristaLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const activeIndex = NAV.findIndex((item) =>
    item.to === '/motorista' ? location.pathname === '/motorista' : location.pathname.startsWith(item.to),
  )

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f7f6' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: `1px solid ${colors.green[100]}` }}>
        <Toolbar sx={{ gap: 1 }}>
          <BadgeIcon sx={{ color: colors.green[800], fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.green[800], lineHeight: 1.1 }}>
              ELISAL-EP
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Recolha de resíduos
            </Typography>
          </Box>
          {user && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: colors.green[800], color: '#ffffff', width: 32, height: 32, fontSize: 14 }}>
                {user.nome.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.nome}
                </Typography>
              </Box>
              <Tooltip title="Sair">
                <Avatar
                  component="button"
                  onClick={() => void handleLogout()}
                  sx={{
                    bgcolor: 'transparent',
                    color: colors.green[800],
                    width: 32,
                    height: 32,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  <LogoutIcon fontSize="small" />
                </Avatar>
              </Tooltip>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, pb: 9 }}>
        <Outlet />
      </Box>

      <Paper
        elevation={3}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: `1px solid ${colors.green[100]}` }}
      >
        <BottomNavigation
          value={activeIndex === -1 ? 0 : activeIndex}
          onChange={(_e, index) => navigate(NAV[index].to)}
          sx={{ height: 72, '& .MuiBottomNavigationAction-root': { minWidth: 64 } }}
        >
          {NAV.map((item) => (
            <BottomNavigationAction
              key={item.to}
              label={item.label}
              icon={item.icon}
              sx={{
                '& .MuiSvgIcon-root': { fontSize: 26 },
                '&.Mui-selected': { color: colors.green[800] },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
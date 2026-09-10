import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  AddCircle as AddCircleIcon,
  Badge as BadgeIcon,
  EventAvailable as EventAvailableIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Payments as PaymentsIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme'

const NAV = [
  { to: '/cliente', label: 'Visão geral', icon: <HomeIcon /> },
  { to: '/cliente/contratos', label: 'Meus contratos', icon: <ReceiptLongIcon /> },
  { to: '/cliente/contratos/novo', label: 'Novo contrato', icon: <AddCircleIcon /> },
  { to: '/cliente/financeiro', label: 'Financeiro', icon: <PaymentsIcon /> },
  { to: '/cliente/agendamentos', label: 'Agendamentos', icon: <EventAvailableIcon /> },
]

const DRAWER_WIDTH = 260

export default function ClientLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleClick = (to: string) => {
    navigate(to)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0b4a2e' }}>
      <Stack direction="row" spacing={1.5} sx={{ px: 2.5, py: 2.5, alignItems: 'center' }}>
        <BadgeIcon sx={{ color: '#ffffff', fontSize: 30 }} />
        <Stack>
          <Typography variant="h6" sx={{ color: '#ffffff', lineHeight: 1.1 }}>
            ELISAL-EP
          </Typography>
          <Typography variant="caption" sx={{ color: '#b9dcc9' }}>
            Gestão de recolha
          </Typography>
        </Stack>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      <Box sx={{ overflow: 'auto', flex: 1, pt: 1, px: 2 }}>
        <List disablePadding>
          {NAV.map((item) => (
            <ListItemButton
              key={item.to}
              onClick={() => handleClick(item.to)}
              selected={isActive(item.to)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: '#e3f2ea',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                '&.Mui-selected': {
                  bgcolor: '#ffffff',
                  color: colors.green[800],
                  '&:hover': { bgcolor: '#ffffff' },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36, '& .MuiSvgIcon-root': { fontSize: 20 } }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 500 } } }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      {user && (
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#ffffff', color: colors.green[800], width: 36, height: 36 }}>
              {user.nome.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ color: '#ffffff', fontWeight: 600 }}>
                {user.nome}
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: '#9ecbb2' }}>
                {user.email}
              </Typography>
            </Box>
            <Tooltip title="Sair">
              <IconButton onClick={handleLogout} sx={{ color: '#d7ecdf' }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      )}
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          boxShadow: 'none',
          borderBottom: `1px solid ${colors.green[100]}`,
          bgcolor: '#ffffff',
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="text.primary" noWrap>
            Área do Cliente
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: '#0b4a2e' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: '#0b4a2e' },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  )

  function isActive(to: string): boolean {
    if (to === '/cliente') return location.pathname === '/cliente'
    return location.pathname.startsWith(to)
  }
}
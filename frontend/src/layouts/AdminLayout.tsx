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
  Badge as BadgeIcon,
  Dashboard as DashboardIcon,
  DirectionsBus as DirectionsBusIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  DeleteSweep as DeleteSweepIcon,
  LocationCity as LocationCityIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme'

const NAV = [
  { to: '/', label: 'Visão geral', icon: <DashboardIcon />, section: 'Administração' },
  { to: '/tipos-residuos', label: 'Tipos de resíduos', icon: <DeleteSweepIcon />, section: 'Administração' },
  { to: '/veiculos', label: 'Veículos', icon: <DirectionsBusIcon />, section: 'Administração' },
  { to: '/cobertura', label: 'Cobertura', icon: <LocationCityIcon />, section: 'Administração' },
  { to: '/utilizadores', label: 'Utilizadores', icon: <PersonIcon />, section: 'Administração' },
  { to: '/clientes', label: 'Clientes', icon: <AssignmentIcon />, section: 'Clientes' },
  { to: '/contratos', label: 'Contratos', icon: <DescriptionIcon />, section: 'Clientes' },
]

const SECTIONS = ['Administração', 'Clientes']

const DRAWER_WIDTH = 260

export default function AdminLayout() {
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

      <Box sx={{ overflow: 'auto', flex: 1, pt: 1 }}>
        {SECTIONS.map((section) => {
          const items = NAV.filter((i) => i.section === section)
          if (items.length === 0) return null
          const hasActive = items.some((i) => isActive(i.to))

          return (
            <Box key={section} sx={{ px: 2, mt: 2 }}>
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  px: 1,
                  color: hasActive ? '#9fe0b8' : '#7fb293',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                {section}
              </Typography>
              <List disablePadding sx={{ mt: 0.5 }}>
                {items.map((item) => (
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
                    <ListItemIcon
                      sx={{ color: 'inherit', minWidth: 36, '& .MuiSvgIcon-root': { fontSize: 20 } }}
                    >
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
          )
        })}
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
            Área Administrativa
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
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }
}
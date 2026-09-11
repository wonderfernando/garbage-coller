import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AuthProvider, useAuth } from './context/AuthContext'
import { theme } from './theme'
import AdminLayout from './layouts/AdminLayout'
import ClientLayout from './layouts/ClientLayout'
import MotoristaLayout from './layouts/MotoristaLayout'
import { RequireAuth, RequireRole, roleHomePath } from './components/RoleGuard'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import LoginClientePage from './pages/LoginClientePage'
import LoginStaffPage from './pages/LoginStaffPage'
import RegistoPage from './pages/RegistoPage'
import DashboardPage from './pages/admin/DashboardPage'
import AgendamentosAdminPage from './pages/admin/AgendamentosPage'
import ContratosPage from './pages/admin/ContratosPage'
import ContratoDetalheAdminPage from './pages/admin/ContratoDetalheAdminPage'
import TiposResiduosPage from './pages/admin/TiposResiduosPage'
import VeiculosPage from './pages/admin/VeiculosPage'
import CoberturaPage from './pages/admin/CoberturaPage'
import ClientesPage from './pages/admin/ClientesPage'
import ClientePerfilPage from './pages/admin/ClientePerfilPage'
import UtilizadoresPage from './pages/admin/UtilizadoresPage'
import ClienteDashboardPage from './pages/cliente/DashboardPage'
import MeusContratosPage from './pages/cliente/MeusContratosPage'
import NovoContratoPage from './pages/cliente/NovoContratoPage'
import ContratoDetalhePage from './pages/cliente/ContratoDetalhePage'
import FinanceiroPage from './pages/cliente/FinanceiroPage'
import AgendamentosPage from './pages/cliente/AgendamentosPage'
import MotoristaDashboardPage from './pages/motorista/DashboardPage'
import CronogramaPage from './pages/motorista/CronogramaPage'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return <Navigate to={roleHomePath(user.role)} replace />
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/cliente" element={<LoginClientePage />} />
            <Route path="/login/funcionario" element={<LoginStaffPage />} />
            <Route path="/registar" element={<RegistoPage />} />

            <Route
              element={
                <RequireAuth>
                  <RequireRole role="admin">
                    <AdminLayout />
                  </RequireRole>
                </RequireAuth>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/contratos" element={<ContratosPage />} />
              <Route path="/contratos/:id" element={<ContratoDetalheAdminPage />} />
              <Route path="/tipos-residuos" element={<TiposResiduosPage />} />
              <Route path="/veiculos" element={<VeiculosPage />} />
              <Route path="/cobertura" element={<CoberturaPage />} />
              <Route path="/utilizadores" element={<UtilizadoresPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/clientes/:id" element={<ClientePerfilPage />} />
              <Route path="/agendamentos" element={<AgendamentosAdminPage />} />
            </Route>

            <Route
              element={
                <RequireAuth>
                  <RequireRole role="cliente">
                    <ClientLayout />
                  </RequireRole>
                </RequireAuth>
              }
            >
              <Route path="/cliente" element={<ClienteDashboardPage />} />
              <Route path="/cliente/contratos" element={<MeusContratosPage />} />
              <Route path="/cliente/contratos/novo" element={<NovoContratoPage />} />
              <Route path="/cliente/contratos/:id" element={<ContratoDetalhePage />} />
              <Route path="/cliente/financeiro" element={<FinanceiroPage />} />
              <Route path="/cliente/agendamentos" element={<AgendamentosPage />} />
            </Route>

            <Route
              element={
                <RequireAuth>
                  <RequireRole role="motorista">
                    <MotoristaLayout />
                  </RequireRole>
                </RequireAuth>
              }
            >
              <Route path="/motorista" element={<MotoristaDashboardPage />} />
              <Route path="/motorista/cronograma" element={<CronogramaPage />} />
            </Route>

            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
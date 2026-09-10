import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AuthProvider, useAuth } from './context/AuthContext'
import { theme } from './theme'
import AdminLayout from './layouts/AdminLayout'
import ClientLayout from './layouts/ClientLayout'
import { RequireAuth, RequireRole, roleHomePath } from './components/RoleGuard'
import LoginPage from './pages/LoginPage'
import RegistoPage from './pages/RegistoPage'
import DashboardPage from './pages/admin/DashboardPage'
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

function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={roleHomePath(user?.role)} replace />
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
              <Route path="/" element={<DashboardPage />} />
              <Route path="/contratos" element={<ContratosPage />} />
              <Route path="/contratos/:id" element={<ContratoDetalheAdminPage />} />
              <Route path="/tipos-residuos" element={<TiposResiduosPage />} />
              <Route path="/veiculos" element={<VeiculosPage />} />
              <Route path="/cobertura" element={<CoberturaPage />} />
              <Route path="/utilizadores" element={<UtilizadoresPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/clientes/:id" element={<ClientePerfilPage />} />
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

            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
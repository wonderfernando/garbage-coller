import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import { theme } from './theme'
import AdminLayout from './layouts/AdminLayout'
import { RequireAuth, RequireRole } from './components/RoleGuard'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import ContratosPage from './pages/admin/ContratosPage'
import TiposResiduosPage from './pages/admin/TiposResiduosPage'
import VeiculosPage from './pages/admin/VeiculosPage'
import CoberturaPage from './pages/admin/CoberturaPage'
import ClientesPage from './pages/admin/ClientesPage'
import ClientePerfilPage from './pages/admin/ClientePerfilPage'
import UtilizadoresPage from './pages/admin/UtilizadoresPage'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

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
              <Route path="/tipos-residuos" element={<TiposResiduosPage />} />
              <Route path="/veiculos" element={<VeiculosPage />} />
              <Route path="/cobertura" element={<CoberturaPage />} />
              <Route path="/utilizadores" element={<UtilizadoresPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/clientes/:id" element={<ClientePerfilPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
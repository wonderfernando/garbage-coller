import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { administracaoApi } from '../../api/administracao'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView'
import { formatData } from '../../types'
import type { User } from '../../types'

const TIPO_CLIENTE_LABEL: Record<string, string> = {
  particular: 'Particular',
  empresa: 'Empresa',
}

export default function ClientesPage() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setClientes(await administracaoApi.listarClientes())
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Box>
      <PageHeader
        title="Clientes"
        subtitle="Consultar os clientes registados no sistema"
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : loading ? (
        <LoadingState />
      ) : clientes.length === 0 ? (
        <Card elevation={0}>
          <EmptyState message="Ainda não existem clientes registados." />
        </Card>
      ) : (
        <Card elevation={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>NIF</TableCell>
                  <TableCell align="center">Contratos</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell>Registado em</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Box
                        component="button"
                        type="button"
                        onClick={() => navigate(`/clientes/${c.id}`)}
                        sx={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          bgcolor: 'transparent',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {c.nome}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.25, alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {c.email}
                        </Typography>
                        {c.bloqueado && <Chip size="small" label="Bloqueado" color="error" />}
                      </Stack>
                    </TableCell>
                    <TableCell>{c.telefone ?? '—'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={TIPO_CLIENTE_LABEL[c.tipo_cliente ?? ''] ?? c.tipo_cliente ?? '—'}
                        color={c.tipo_cliente === 'empresa' ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{c.nif ?? '—'}</TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={c.contratos_count ?? 0} color="success" variant="outlined" />
                    </TableCell>
                    <TableCell>{c.endereco_principal ?? '—'}</TableCell>
                    <TableCell>{formatData(c.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  )
}

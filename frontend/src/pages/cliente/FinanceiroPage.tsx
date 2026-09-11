import { useCallback, useEffect, useState } from 'react'
import { Card, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { clienteApi } from '../../api/cliente'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView'
import { PARCELA_ESTADO } from './estados'
import { formatData, formatMoeda } from '../../types'
import type { ParcelaMensalidade } from '../../types'

export default function FinanceiroPage() {
  const [parcelas, setParcelas] = useState<ParcelaMensalidade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setParcelas(await clienteApi.meusParcelas())
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const emAberto = parcelas.filter((p) => p.estado === 'pendente')
  const totalAberto = emAberto.reduce((acc, p) => acc + Number(p.valor), 0)

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Mensalidades dos seus contratos de recolha"
      />
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : loading ? (
        <LoadingState />
      ) : parcelas.length === 0 ? (
        <Card elevation={0}>
          <EmptyState message="Sem mensalidades. As parcelas aparecem após a aprovação de um contrato." />
        </Card>
      ) : (
        <>
          <Card elevation={0} sx={{ p: 3, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Total em aberto
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {formatMoeda(totalAberto)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {emAberto.length} parcela(s) pendente(s)
            </Typography>
          </Card>

          <Card elevation={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Contrato</TableCell>
                    <TableCell>Parcela</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parcelas.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          #{p.contrato_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.contrato?.tipoResiduo?.nome ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>Parcela {p.numero_parcela}</TableCell>
                      <TableCell>{formatData(p.data_vencimento)}</TableCell>
                      <TableCell align="right">{formatMoeda(p.valor)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={PARCELA_ESTADO[p.estado].label}
                          color={PARCELA_ESTADO[p.estado].color}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </div>
  )
}
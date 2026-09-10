import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowForward } from '@mui/icons-material'
import { Card, CardActionArea, Chip, Grid, Stack, Typography } from '@mui/material'
import { clienteApi } from '../../api/cliente'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView'
import { ESTADO_CONTRATO_COLOR } from './estados'
import { ESTADO_CONTRATO_LABEL, formatData, formatMoeda, nomeDiaSemana } from '../../types'
import type { Contrato } from '../../types'

export default function MeusContratosPage() {
  const navigate = useNavigate()
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setContratos(await clienteApi.meusContratos())
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
    <div>
      <PageHeader
        title="Meus contratos"
        subtitle="Contratos de recolha de resíduos associados à sua conta"
      />
      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : loading ? (
        <LoadingState />
      ) : contratos.length === 0 ? (
        <Card elevation={0}>
          <EmptyState message="Ainda não possui contratos. Abra o primeiro em “Novo contrato”." />
        </Card>
      ) : (
        <Grid container spacing={2}>
          {contratos.map((c) => (
            <Grid key={c.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card elevation={0} sx={{ height: '100%' }}>
                <CardActionArea
                  onClick={() => navigate(`/cliente/contratos/${c.id}`)}
                  sx={{ height: '100%', p: 2.5 }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Contrato #{c.id}</Typography>
                      <Chip
                        size="small"
                        label={ESTADO_CONTRATO_LABEL[c.estado]}
                        color={ESTADO_CONTRATO_COLOR[c.estado]}
                      />
                    </Stack>

                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {c.tipoResiduo?.nome ?? '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.distrito?.nome ?? `Distrito #${c.distrito_id}`} · aberto em {formatData(c.created_at)}
                    </Typography>

                    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {(c.diasSemana ?? []).map((d) => (
                        <Chip key={d.id} size="small" label={nomeDiaSemana(d.dia_semana)} />
                      ))}
                    </Stack>

                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {formatMoeda(c.valor_mensal)}
                        <Typography variant="caption" color="text.secondary" component="span">
                          /mês
                        </Typography>
                      </Typography>
                      <ArrowForward fontSize="small" color="action" />
                    </Stack>
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  )
}
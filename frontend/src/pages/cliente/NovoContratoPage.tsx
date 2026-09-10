import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { z } from 'zod'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { clienteApi } from '../../api/cliente'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { ErrorState, LoadingState } from '../../components/StateView'
import { DIAS_SEMANA, formatMoeda, nomeDiaSemana } from '../../types'
import type { Distrito, Municipio, Provincia, TipoResiduo } from '../../types'

const contratoSchema = z.object({
  distrito_id: z.coerce.number({ message: 'Selecione o distrito.' }).min(1, 'Selecione o distrito.'),
  tipo_residuo_id: z.coerce.number({ message: 'Selecione o tipo de resíduo.' }).min(1, 'Selecione o tipo de resíduo.'),
  duracao_meses: z.coerce.number({ message: 'Indique a duração.' }).min(1, 'A duração mínima é 1 mês.'),
  rua: z.string().optional(),
  ponto_referencia: z.string().optional(),
})

type ContratoForm = z.infer<typeof contratoSchema>

export default function NovoContratoPage() {
  const navigate = useNavigate()
  const [distritos, setDistritos] = useState<Distrito[]>([])
  const [tipos, setTipos] = useState<TipoResiduo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dias, setDias] = useState<number[]>([])
  const [provinciaId, setProvinciaId] = useState(0)
  const [municipioId, setMunicipioId] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContratoForm>({
    resolver: zodResolver(contratoSchema) as Resolver<ContratoForm, unknown, ContratoForm>,
    defaultValues: { distrito_id: 0, tipo_residuo_id: 0, duracao_meses: 12, rua: '', ponto_referencia: '' },
  })

  const distritoId = watch('distrito_id')
  const tipoId = watch('tipo_residuo_id')
  const duracao = watch('duracao_meses')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [distritosData, tiposData] = await Promise.all([
        clienteApi.listarDistritos(),
        clienteApi.listarTiposResiduos(),
      ])
      setDistritos(distritosData)
      setTipos(tiposData)
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const distritoSelecionado = useMemo(
    () => distritos.find((d) => d.id === distritoId),
    [distritos, distritoId],
  )

  const provincias = useMemo(() => {
    const porId = new Map<number, Provincia>()
    for (const d of distritos) {
      const p = d.municipio?.provincia
      if (p && !porId.has(p.id)) porId.set(p.id, p)
    }
    return [...porId.values()].sort((a, b) => a.nome.localeCompare(b.nome))
  }, [distritos])

  const municipios = useMemo(() => {
    const porId = new Map<number, Municipio>()
    for (const d of distritos) {
      const m = d.municipio
      if (m && m.provincia_id === provinciaId && !porId.has(m.id)) porId.set(m.id, m)
    }
    return [...porId.values()].sort((a, b) => a.nome.localeCompare(b.nome))
  }, [distritos, provinciaId])

  const distritosDoMunicipio = useMemo(
    () => distritos.filter((d) => d.municipio_id === municipioId).sort((a, b) => a.nome.localeCompare(b.nome)),
    [distritos, municipioId],
  )

  const municipioSelecionado = useMemo(
    () => municipios.find((m) => m.id === municipioId),
    [municipios, municipioId],
  )

  const provinciaSelecionada = useMemo(
    () => provincias.find((p) => p.id === provinciaId),
    [provincias, provinciaId],
  )

  const handleProvinciaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProvinciaId(Number(e.target.value))
    setMunicipioId(0)
    setValue('distrito_id', 0)
    setDias([])
  }

  const handleMunicipioChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMunicipioId(Number(e.target.value))
    setValue('distrito_id', 0)
    setDias([])
  }

  const handleDistritoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue('distrito_id', Number(e.target.value))
    setDias([])
  }

  const diasDisponiveis = useMemo(() => {
    const disponiveis = (distritoSelecionado?.disponibilidades ?? []).map((d) => d.dia_semana)
    return DIAS_SEMANA.filter((d) => disponiveis.includes(d.value))
  }, [distritoSelecionado])

  const tipoSelecionado = useMemo(() => tipos.find((t) => t.id === tipoId), [tipos, tipoId])

  const valores = useMemo(() => {
    const preco = Number(tipoSelecionado?.preco_unitario_recolha ?? 0)
    const taxa = Number(tipoSelecionado?.taxa_adesao ?? 0)
    const valorMensal = dias.length * 4 * preco
    return {
      valorMensal,
      valorTotal: Number((taxa + valorMensal * Math.max(Number(duracao || 0), 0)).toFixed(2)),
      taxa,
    }
  }, [tipoSelecionado, dias.length, duracao])

  const toggleDia = (dia: number) => {
    setDias((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]))
  }

  const onSubmit = async (values: ContratoForm) => {
    setSubmitError(null)
    const diasDisponiveisIds = new Set(diasDisponiveis.map((d) => d.value))
    const diasSelecionados = dias.filter((d) => diasDisponiveisIds.has(d))
    if (diasSelecionados.length === 0) {
      setSubmitError('Selecione pelo menos um dia de recolha disponível no distrito.')
      return
    }
    setSubmitting(true)
    try {
      const contrato = await clienteApi.criarContrato({
        distrito_id: values.distrito_id,
        tipo_residuo_id: values.tipo_residuo_id,
        dias_semana: diasSelecionados,
        duracao_meses: values.duracao_meses,
        rua: values.rua || undefined,
        ponto_referencia: values.ponto_referencia || undefined,
      })
      navigate(`/cliente/contratos/${contrato.id}`, { replace: true })
    } catch (err) {
      setSubmitError(readApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />

  return (
    <Box>
      <PageHeader
        title="Novo contrato"
        subtitle="Solicite a recolha de resíduos para o seu endereço"
      />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={0} sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                {submitError && <Alert severity="error">{submitError}</Alert>}

                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Localização
                </Typography>

                <TextField
                  label="Província"
                  select
                  fullWidth
                  value={provinciaId}
                  onChange={handleProvinciaChange}
                >
                  <MenuItem value={0} disabled>
                    Selecione a província
                  </MenuItem>
                  {provincias.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nome}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Município"
                  select
                  fullWidth
                  value={municipioId}
                  onChange={handleMunicipioChange}
                  disabled={provinciaId === 0}
                >
                  <MenuItem value={0} disabled>
                    Selecione o município
                  </MenuItem>
                  {municipios.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.nome}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Distrito"
                  select
                  fullWidth
                  value={distritoId}
                  onChange={handleDistritoChange}
                  disabled={municipioId === 0}
                  error={Boolean(errors.distrito_id)}
                  helperText={errors.distrito_id?.message}
                >
                  <MenuItem value={0} disabled>
                    Selecione o distrito
                  </MenuItem>
                  {distritosDoMunicipio.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.nome}
                    </MenuItem>
                  ))}
                </TextField>

                <Stack spacing={1}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Dias de recolha disponíveis
                  </Typography>
                  {!distritoSelecionado ? (
                    <Typography variant="caption" color="text.secondary">
                      Selecione um distrito para ver os dias disponíveis.
                    </Typography>
                  ) : diasDisponiveis.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      Este distrito ainda não tem dias de recolha definidos.
                    </Typography>
                  ) : (
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {diasDisponiveis.map((d) => (
                        <Chip
                          key={d.value}
                          label={d.label}
                          clickable
                          color={dias.includes(d.value) ? 'primary' : 'default'}
                          variant={dias.includes(d.value) ? 'filled' : 'outlined'}
                          onClick={() => toggleDia(d.value)}
                          sx={{ fontWeight: 500 }}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>

                <TextField
                  label="Tipo de resíduo"
                  select
                  fullWidth
                  {...register('tipo_residuo_id')}
                  error={Boolean(errors.tipo_residuo_id)}
                  helperText={errors.tipo_residuo_id?.message}
                >
                  <MenuItem value={0} disabled>
                    Selecione o tipo de resíduo
                  </MenuItem>
                  {tipos.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.nome} · {formatMoeda(t.preco_unitario_recolha)}/recolha
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Duração (meses)"
                  type="number"
                  slotProps={{ htmlInput: { min: 1 } }}
                  fullWidth
                  {...register('duracao_meses')}
                  error={Boolean(errors.duracao_meses)}
                  helperText={errors.duracao_meses?.message}
                />

                <Divider />

                <TextField
                  label="Rua (opcional)"
                  fullWidth
                  {...register('rua')}
                  error={Boolean(errors.rua)}
                  helperText={errors.rua?.message}
                />
                <TextField
                  label="Ponto de referência (opcional)"
                  fullWidth
                  {...register('ponto_referencia')}
                  error={Boolean(errors.ponto_referencia)}
                  helperText={errors.ponto_referencia?.message}
                />
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card elevation={0} sx={{ p: 3, position: 'sticky', top: 88 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Resumo do contrato
              </Typography>

              <Stack spacing={1.5}>
                <ResumoLinha label="Tipo de resíduo" valor={tipoSelecionado?.nome ?? '—'} />
                <ResumoLinha
                  label="Localização"
                  valor={
                    [provinciaSelecionada?.nome, municipioSelecionado?.nome, distritoSelecionado?.nome]
                      .filter(Boolean)
                      .join(' · ') || '—'
                  }
                />
                <ResumoLinha
                  label="Dias escolhidos"
                  valor={dias.length === 0 ? '—' : dias.map((d) => nomeDiaSemana(d)).join(', ')}
                />
                <ResumoLinha label="Frequência semanal" valor={dias.length === 0 ? '—' : `${dias.length}x por semana`} />
                <ResumoLinha label="Duração" valor={`${duracao || 0} meses`} />
                <ResumoLinha label="Taxa de adesão" valor={formatMoeda(valores.taxa)} />

                <Divider />

                <ResumoLinha label="Valor mensal" valor={formatMoeda(valores.valorMensal)} destaque />
                <ResumoLinha label="Valor total" valor={formatMoeda(valores.valorTotal)} destaque />
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{ mt: 3 }}
              >
                Solicitar contrato
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

function ResumoLinha({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant={destaque ? 'h6' : 'body2'}
        sx={{ fontWeight: destaque ? 700 : 500, textAlign: 'right' }}
      >
        {valor}
      </Typography>
    </Stack>
  )
}
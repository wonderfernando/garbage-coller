import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Add, Edit, Search } from '@mui/icons-material'
import { administracaoApi } from '../../api/administracao'
import { readApiError } from '../../api/client'
import PageHeader from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/StateView'
import { colors } from '../../theme'
import { DIAS_SEMANA, nomeDiaSemana } from '../../types'
import type { Distrito, Provincia } from '../../types'

export default function CoberturaPage() {
  const [distritos, setDistritos] = useState<Distrito[]>([])
  const [provincias, setProvincias] = useState<Provincia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [provinciaFiltro, setProvinciaFiltro] = useState('')
  const [municipioFiltro, setMunicipioFiltro] = useState('')
  const [selected, setSelected] = useState<Distrito | null>(null)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [provs, dists] = await Promise.all([
        administracaoApi.listarProvincias(),
        administracaoApi.listarDistritos(),
      ])
      setProvincias(provs)
      setDistritos(dists)
    } catch (err) {
      setError(readApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (selected) {
      setSelectedDays((selected.disponibilidades ?? []).map((d) => d.dia_semana))
      setActionError(null)
    }
  }, [selected])

  const provinciaId = provinciaFiltro ? Number(provinciaFiltro) : null
  const municipioId = municipioFiltro ? Number(municipioFiltro) : null

  const municipiosDaProvincia =
    provincias.find((p) => p.id === provinciaId)?.municipios ?? []

  const filtered = distritos.filter((d) => {
    if (provinciaId && d.municipio?.provincia_id !== provinciaId) return false
    if (municipioId && d.municipio_id !== municipioId) return false

    const q = search.trim().toLowerCase()
    if (!q) return true
    const text = [d.nome, d.municipio?.nome, d.municipio?.provincia?.nome]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return text.includes(q)
  })

  const toggleDay = (dia: number) => {
    setSelectedDays((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia].sort((a, b) => a - b)
    )
  }

  const refreshSelected = async () => {
    const data = await administracaoApi.listarDistritos()
    setDistritos(data)
    setSelected(data.find((d) => d.id === selected?.id) ?? null)
  }

  const saveDays = async () => {
    if (!selected) return
    setSaving(true)
    setActionError(null)
    try {
      const current = new Set((selected.disponibilidades ?? []).map((d) => d.dia_semana))
      const target = new Set(selectedDays)

      for (const dia of target) {
        if (!current.has(dia)) {
          await administracaoApi.adicionarDisponibilidade(selected.id, dia)
        }
      }
      for (const dia of current) {
        if (!target.has(dia)) {
          await administracaoApi.removerDisponibilidade(selected.id, dia)
        }
      }

      await refreshSelected()
      setSelected(null)
    } catch (err) {
      setActionError(readApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <PageHeader
        title="Cobertura"
        subtitle="Distritos de recolha e dias da semana disponíveis em cada um"
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : loading ? (
        <LoadingState />
      ) : distritos.length === 0 ? (
        <Card elevation={0}>
          <EmptyState message="Não existem distritos registados." />
        </Card>
      ) : (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Província"
              size="small"
              sx={{ minWidth: 220, maxWidth: 320 }}
              value={provinciaFiltro}
              onChange={(e) => {
                setProvinciaFiltro(e.target.value)
                setMunicipioFiltro('')
              }}
            >
              <MenuItem value="">Todas</MenuItem>
              {provincias.map((p) => (
                <MenuItem key={p.id} value={p.id as never}>
                  {p.nome}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Município"
              size="small"
              sx={{ minWidth: 220, maxWidth: 320 }}
              value={municipioFiltro}
              onChange={(e) => setMunicipioFiltro(e.target.value)}
              disabled={!provinciaId}
            >
              <MenuItem value="">Todos</MenuItem>
              {municipiosDaProvincia.map((m) => (
                <MenuItem key={m.id} value={m.id as never}>
                  {m.nome}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por distrito, município ou província"
              size="small"
              sx={{ minWidth: 280, maxWidth: 420, flex: 1 }}
              slotProps={{ input: { startAdornment: <Search color="disabled" sx={{ mr: 1, fontSize: 20 }} /> } }}
            />
          </Stack>

          <Card elevation={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Distrito</TableCell>
                    <TableCell>Município / Província</TableCell>
                    <TableCell>Dias disponíveis</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          Nenhum distrito corresponde à pesquisa.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {d.nome}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {d.municipio?.nome ?? '—'} · {d.municipio?.provincia?.nome ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                            {(d.disponibilidades ?? []).length === 0 ? (
                              <Typography variant="caption" color="text.secondary">
                                Sem dias definidos
                              </Typography>
                            ) : (
                              (d.disponibilidades ?? []).map((disp) => (
                                <Chip
                                  key={disp.id}
                                  size="small"
                                  label={nomeDiaSemana(disp.dia_semana)}
                                />
                              ))
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Configurar dias de recolha">
                            <IconButton size="small" color="primary" onClick={() => setSelected(d)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Dias de recolha · {selected?.nome}</DialogTitle>
        <DialogContent>
          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {selected?.municipio?.nome ?? '—'} · {selected?.municipio?.provincia?.nome ?? '—'} — selecione os
            dias da semana em que a recolha está disponível neste distrito.
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2, justifyContent: 'space-between' }}>
            {DIAS_SEMANA.map((dia) => {
              const on = selectedDays.includes(dia.value)
              return (
                <Stack key={dia.value} sx={{ flex: 1, minWidth: 0, alignItems: 'center' }} spacing={0.5}>
                  <Tooltip title={dia.label}>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => toggleDay(dia.value)}
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: on ? colors.green[600] : 'divider',
                        bgcolor: on ? colors.green[600] : 'transparent',
                        color: on ? '#ffffff' : 'text.primary',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s, color 0.15s, border-color 0.15s',
                        '&:hover': {
                          bgcolor: on ? colors.green[700] : colors.green[50],
                        },
                      }}
                    >
                      {dia.label.charAt(0)}
                    </Box>
                  </Tooltip>
                  <Typography
                    variant="caption"
                    color={on ? 'text.primary' : 'text.secondary'}
                    sx={{
                      textAlign: 'center',
                      fontSize: 11,
                      lineHeight: 1.1,
                      display: 'block',
                      whiteSpace: 'normal',
                    }}
                  >
                    {dia.label}
                  </Typography>
                </Stack>
              )
            })}
          </Stack>

          {selectedDays.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nenhum dia selecionado. Selecione pelo menos um dia da semana.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => void saveDays()}
            disabled={saving || selectedDays.length === 0}
          >
            {saving ? 'A guardar...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

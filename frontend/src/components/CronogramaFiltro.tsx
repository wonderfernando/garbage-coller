import { Button, Card, IconButton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight, Today as TodayIcon } from '@mui/icons-material'
import { colors } from '../theme'

export type CronogramaModo = 'dia' | 'semana'

export function addDays(d: Date, days: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + days)
  return next
}

export function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function calcularRange(modo: CronogramaModo, dia: Date): { inicio: string; fim: string; fimDate: Date } {
  const inicio = toYmd(dia)
  const fimDate = addDays(dia, modo === 'dia' ? 0 : 6)
  return { inicio, fim: toYmd(fimDate), fimDate }
}

function mesCurto(d: Date): string {
  return new Intl.DateTimeFormat('pt-PT', { month: 'short' }).format(d)
}

export function rotuloPeriodo(modo: CronogramaModo, dia: Date): string {
  const fmt = new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' })
  const isHoje = toYmd(dia) === toYmd(new Date())
  if (modo === 'dia') {
    return isHoje ? 'Hoje' : fmt.format(dia)
  }
  const { fimDate } = calcularRange(modo, dia)
  const inicio = `${fmt.format(dia).split(',')[0].trim()}, ${dia.getDate()} ${mesCurto(dia)}`
  return `${inicio} — ${fmt.format(fimDate)}`
}

interface CronogramaFiltroProps {
  title: string
  modo: CronogramaModo
  onModo: (modo: CronogramaModo) => void
  dia: Date
  onDia: (dia: Date) => void
}

export default function CronogramaFiltro({ title, modo, onModo, dia, onDia }: CronogramaFiltroProps) {
  const navegar = (direcao: 1 | -1) => {
    onDia(addDays(dia, modo === 'dia' ? direcao : 7 * direcao))
  }

  const { inicio, fim } = calcularRange(modo, dia)

  return (
    <Stack spacing={1}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <ToggleButtonGroup size="small" exclusive value={modo} onChange={(_e, v) => v && onModo(v as CronogramaModo)}>
          <ToggleButton value="dia" sx={{ px: 2 }}>
            Dia
          </ToggleButton>
          <ToggleButton value="semana" sx={{ px: 2 }}>
            Semana
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Card elevation={0} sx={{ px: 1, py: 0.5, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navegar(-1)} sx={{ py: 1.5 }}>
          <ChevronLeft />
        </IconButton>
        <Stack sx={{ flex: 1, alignItems: 'center', minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
            {rotuloPeriodo(modo, dia)}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {inicio === fim ? inicio : `${inicio} — ${fim}`}
          </Typography>
        </Stack>
        <IconButton onClick={() => navegar(1)} sx={{ py: 1.5 }}>
          <ChevronRight />
        </IconButton>
      </Card>

      <Button
        onClick={() => onDia(new Date())}
        startIcon={<TodayIcon />}
        sx={{ alignSelf: 'center', color: colors.green[800] }}
      >
        Ir para hoje
      </Button>
    </Stack>
  )
}
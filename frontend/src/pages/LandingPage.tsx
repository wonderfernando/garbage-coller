import { Link } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  ArrowForward as ArrowForwardIcon,
  Autorenew as AutorenewIcon,
  CleaningServices as CleaningServicesIcon,
  Delete,
  EmailOutlined as EmailIcon,
  LocalShipping as ShippingIcon,
  LocationOnOutlined as LocationIcon,
  PhoneOutlined as PhoneIcon,
  Recycling as RecyclingIcon,
  WaterDrop as WaterDropIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material'
import { colors } from '../theme'
import type { ReactNode } from 'react'

const HERO_IMG = 'dasdas.jpeg'
const ABOUT_IMG = 'dad.jpg'

const SERVICOS: { icon: ReactNode; title: string; desc: string }[] = [
  {
    icon: <ShippingIcon />,
    title: 'Recolha e transporte',
    desc: 'Recolha porta a porta de resíduos sólidos urbanos, agendada por distrito e acompanhada em tempo real.',
  },
  {
    icon: <RecyclingIcon />,
    title: 'Recolha selectiva',
    desc: 'Separação e valorização de resíduos recicláveis em parceria com entidades de valorização.',
  },
  {
    icon: <WaterDropIcon />,
    title: 'Sucção de fossas',
    desc: 'Tratamento de fluentes e limpeza de fossas sépticas com equipamento especializado.',
  },
  {
    icon: <CleaningServicesIcon />,
    title: 'Varredura manual e mecanizada',
    desc: 'Limpeza regular de ruas, avenidas e espaços públicos em toda a província de Luanda.',
  },
  {
    icon: <Delete />,
    title: 'Remoção de monos e monstros',
    desc: 'Recolha de resíduos volumosos, móveis velhos e entulhos espalhados na via pública.',
  },
  {
    icon: <AutorenewIcon />,
    title: 'Tratamento de águas residuais',
    desc: 'Gestão do sistema de limpeza e tratamento de fluentes de águas residuais de Luanda.',
  },
]

const PASSOS = [
  { n: '01', title: 'Criar conta de cliente', desc: 'Registe-se no portal em poucos minutos, como particular ou empresa.' },
  { n: '02', title: 'Abrir contrato', desc: 'Escolha o distrito, os dias da semana e o tipo de resíduo a recolher.' },
  { n: '03', title: 'Aprovação ELISAL', desc: 'A ELISAL valida a disponibilidade e aprova o seu contrato.' },
  { n: '04', title: 'Acompanhar tudo', desc: 'Acompanhe os agendamentos, liquide as mensalidades e descarregue o seu recibo.' },
]

export default function LandingPage() {
  return (
    <Box>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2f2e9' }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <img src="/logo.png" alt="ELISAL-EP" style={{ height: 44 }} />
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
              {[
                { label: 'Quem somos', to: '#quem-somos' },
                { label: 'Serviços', to: '#servicos' },
                { label: 'Como funciona', to: '#como-funciona' },
                { label: 'Contactos', to: '#contactos' },
              ].map((it) => (
                <Typography
                  key={it.label}
                  component="a"
                  href={it.to}
                  variant="body2"
                  sx={{ color: 'text.secondary', fontWeight: 600, textDecoration: 'none', '&:hover': { color: colors.green[700] } }}
                >
                  {it.label}
                </Typography>
              ))}
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
              <Button component={Link} to="/login" variant="outlined">
                Iniciar sessão
              </Button>
              <Button component={Link} to="/registar" variant="contained">
                Criar conta
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box
        component="header"
        sx={{
          background: 'linear-gradient(135deg, #06301f 0%, #0b4a2e 55%, #1f9259 100%)',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={4} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Chip
                label="ELISAL — Empresa Pública de Limpeza Urbana"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#ffffff', mb: 2, fontWeight: 600 }}
              />
              <Typography
                variant="h2"
                sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.1, fontSize: { xs: '2.1rem', md: '3.1rem' } }}
              >
                O seu portal de gestão da recolha de resíduos em Luanda
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, color: '#d5ecdf', fontWeight: 400, maxWidth: 560 }}>
                Abra o seu contrato de recolha porta a porta, acompanhe os agendamentos e liquide as
                mensalidades de forma simples e digital.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
                <Button
                  component={Link}
                  to="/registar"
                  variant="contained"
                  size="large"
                  sx={{ bgcolor: '#ffffff', color: colors.green[900], '&:hover': { bgcolor: '#e2f2e9' } }}
                >
                  Criar conta de cliente
                  <ArrowForwardIcon sx={{ ml: 1, fontSize: 20 }} />
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.55)', '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.08)' } }}
                >
                  Iniciar sessão
                </Button>
              </Stack>
              <Stack direction="row" spacing={4} sx={{ mt: 5 }}>
                {[
                  { v: '+2000', l: 'trabalhadores' },
                  { v: '7', l: 'dias por semana' },
                  { v: '100%', l: 'digital' },
                ].map((s) => (
                  <Box key={s.l}>
                    <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 800 }}>
                      {s.v}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b9dcc9' }}>
                      {s.l}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src={HERO_IMG}
                alt="ELISAL"
                sx={{ maxWidth: '70%', height: 'auto', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="quem-somos" sx={{ py: { xs: 6, md: 9 }, bgcolor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component="img"
                src={ABOUT_IMG}
                alt="Operações ELISAL em Luanda"
                sx={{ width: '100%', borderRadius: 3, boxShadow: '0 12px 40px rgba(11,74,46,0.18)' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip label="Quem somos" size="small" sx={{ bgcolor: colors.green[50], color: colors.green[800], fontWeight: 700, mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
                Gestão do sistema de limpeza de Luanda
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                A ELISAL é uma empresa adstrita ao Governo da Província de Luanda, cujo objeto social é
                a gestão do sistema de limpeza da capital e o tratamento de fluentes de águas residuais.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Com mais de 2000 trabalhadores, garante diariamente a recolha e transporte de resíduos
                sólidos urbanos, a varredura de ruas e o saneamento dos bairros.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                {['Recolha porta a porta', 'Recolha selectiva', 'Sucção de fossas', 'Limpeza de valas'].map((s) => (
                  <Chip key={s} label={s} variant="outlined" sx={{ color: colors.green[800], borderColor: colors.green[100] }} />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="servicos" sx={{ py: { xs: 6, md: 9 }, bgcolor: '#f0faf4' }}>
        <Container maxWidth="lg">
          <Chip label="Serviços" size="small" sx={{ bgcolor: colors.green[100], color: colors.green[800], fontWeight: 700, mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Encontre o melhor serviço para a sua casa ou empresa
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, mb: 4 }}>
            Soluções integradas de limpeza urbana e tratamento de águas residuais, da recolha ao destino final.
          </Typography>
          <Grid container spacing={3}>
            {SERVICOS.map((s) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={s.title}>
                <Card elevation={0} sx={{ height: '100%', p: 3, transition: 'box-shadow .2s ease', '&:hover': { boxShadow: '0 12px 32px rgba(11,74,46,0.12)' } }}>
                  <Box sx={{ bgcolor: colors.green[50], borderRadius: 2, p: 1.5, display: 'inline-flex', color: colors.green[700], mb: 2 }}>
                    {s.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {s.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box id="como-funciona" sx={{ py: { xs: 6, md: 9 }, bgcolor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Chip label="Como funciona" size="small" sx={{ bgcolor: colors.green[50], color: colors.green[800], fontWeight: 700, mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Do registo à recolha, em 4 passos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            O portal digital da ELISAL simplifica a gestão da sua recolha de resíduos.
          </Typography>
          <Grid container spacing={3}>
            {PASSOS.map((p) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p.n}>
                <Box sx={{ position: 'relative' }}>
                  <Typography
                    variant="h2"
                    sx={{ fontWeight: 900, color: colors.green[100], lineHeight: 1, fontSize: '3.4rem', position: 'absolute', top: -38, zIndex: 0 }}
                  >
                    {p.n}
                  </Typography>
                  <Box sx={{ position: 'relative', zIndex: 1, pt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {p.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 8 }, background: 'linear-gradient(135deg, #0b4a2e 0%, #1f9259 100%)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 800, fontSize: { xs: '1.7rem', md: '2.2rem' } }}>
                Pronto para uma recolha mais organizada e sustentável?
              </Typography>
              <Typography variant="body1" sx={{ color: '#d5ecdf', mt: 1 }}>
                Abra hoje o seu contrato de recolha de resíduos na ELISAL.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button
                  component={Link}
                  to="/registar"
                  variant="contained"
                  size="large"
                  sx={{ bgcolor: '#ffffff', color: colors.green[900], '&:hover': { bgcolor: '#e2f2e9' } }}
                >
                  Criar conta gratuita
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box component="footer" id="contactos" sx={{ bgcolor: '#06301f', color: '#ffffff', pt: 6, pb: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 5 }}>
              <img src="/logo.png" alt="ELISAL-EP" style={{ height: 44, marginBottom: 16 }} />
              <Typography variant="body2" sx={{ color: '#b9dcc9', maxWidth: 360 }}>
                Gestão do sistema de limpeza de Luanda e tratamento de fluentes de águas residuais.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <IconButton
                  component="a"
                  href="https://api.whatsapp.com/send?phone=244948707004&text=Elisal"
                  target="_blank"
                  rel="noreferrer"
                  sx={{ color: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' }}
                >
                  <WhatsAppIcon />
                </IconButton>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Contactos
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <PhoneIcon sx={{ fontSize: 18, color: '#9fe0b8' }} />
                  <Typography variant="body2">+244 948 707 002</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <EmailIcon sx={{ fontSize: 18, color: '#9fe0b8' }} />
                  <Typography variant="body2">geral@elisal.ao</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                  <LocationIcon sx={{ fontSize: 18, color: '#9fe0b8', mt: 0.3 }} />
                  <Typography variant="body2">
                    Bairro Vila Flor, Zona 19-S-3, Quarteirão 7 (Filda) — Cazenga, Caixa Postal 378 | Luanda — Angola.
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Acesso ao portal
              </Typography>
              <Stack spacing={0.5}>
                <Button component={Link} to="/login/cliente" sx={{ color: '#d5ecdf', justifyContent: 'flex-start' }}>
                  Área do Cliente
                </Button>
                <Button component={Link} to="/login/funcionario" sx={{ color: '#d5ecdf', justifyContent: 'flex-start' }}>
                  Área Interna (Admin/Motorista)
                </Button>
                <Button component={Link} to="/registar" sx={{ color: '#d5ecdf', justifyContent: 'flex-start' }}>
                  Criar conta de cliente
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.12)', mt: 4, pt: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#7fb293' }}>
              ELISAL © {new Date().getFullYear()} — Empresa Pública. Todos os direitos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    adminGreen: Palette['primary']
  }
  interface PaletteOptions {
    adminGreen?: PaletteOptions['primary']
  }
}

export const colors = {
  green: {
    900: '#06301f',
    800: '#0b4a2e',
    700: '#11603b',
    600: '#177b49',
    500: '#1f9259',
    100: '#e2f2e9',
    50: '#f0faf4',
  },
}

// Fonte Inter carregada via @import no index.css
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.green[800],
      dark: colors.green[900],
      light: colors.green[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.green[600],
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#12141a',
      secondary: '#5b6470',
    },
    adminGreen: {
      main: colors.green[800],
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f5f7f6',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.green[100]}`,
          boxShadow: '0 1px 2px rgba(11,74,46,0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})
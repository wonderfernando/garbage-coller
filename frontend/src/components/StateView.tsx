import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material'
import { Refresh } from '@mui/icons-material'

export function LoadingState() {
  return (
    <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry} startIcon={<Refresh />}>
            Tentar de novo
          </Button>
        ) : undefined
      }
    >
      {message}
    </Alert>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )
}
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Stack,
  Alert,
  Dialog,
  Button,
  Divider,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { StatusChip } from '@/shared/ui/status-chip';
import { paymentsApi, type PaymentDto } from '../../api/payments-api';

type Props = { open: boolean; onClose: () => void; payment: PaymentDto };

export const PaymentDetailDialog = ({ open, onClose, payment }: Props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: attempts, isLoading } = useQuery({
    queryKey: ['payments', payment.id, 'attempts'],
    queryFn: () => paymentsApi.listAttempts(payment.id),
    enabled: open,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
      <DialogTitle>
        Pago <code style={{ fontSize: '0.9em' }}>{payment.id.slice(0, 8)}…</code>{' '}
        <StatusChip variant="payment" status={payment.status} size="small" />
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Método
                </Typography>
                <Typography>{payment.methodKind} ({payment.gateway})</Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Monto
                </Typography>
                <Typography>
                  {Number(payment.displayAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}{' '}
                  {payment.displayCurrency}
                </Typography>
                {payment.chargedAmount && (
                  <Typography variant="caption" color="text.secondary">
                    ≈ {Number(payment.chargedAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}{' '}
                    {payment.chargedCurrency}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Gateway ref.
                </Typography>
                <Typography>{payment.gatewayReference ?? '—'}</Typography>
              </Box>
            </Stack>
          </Box>

          {(payment.failureCode || payment.failureMessage) && (
            <Alert severity="error">
              {payment.failureCode && <strong>{payment.failureCode}: </strong>}
              {payment.failureMessage}
            </Alert>
          )}

          <Divider />

          <Typography variant="subtitle1">Intentos ({attempts?.length ?? 0})</Typography>

          {isLoading && <CircularProgress size={20} />}

          <Stack spacing={1.5}>
            {attempts?.map((a) => (
              <Box key={a.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <StatusChip variant="payment" status={a.status} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(a.createdAt).toLocaleString('es-VE')}
                  </Typography>
                </Stack>
                {a.failureMessage && (
                  <Alert severity="warning" variant="outlined" sx={{ mb: 1 }}>
                    {a.failureCode && <strong>{a.failureCode}: </strong>}
                    {a.failureMessage}
                  </Alert>
                )}
                {a.rawRequest && (
                  <details style={{ marginBottom: 8 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 12 }}>Request</summary>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: 11,
                        bgcolor: 'grey.100',
                        p: 1.5,
                        borderRadius: 0.5,
                        overflow: 'auto',
                        maxHeight: 200,
                        m: 0,
                        mt: 0.5,
                      }}
                    >
                      {JSON.stringify(a.rawRequest, null, 2)}
                    </Box>
                  </details>
                )}
                {a.rawResponse && (
                  <details>
                    <summary style={{ cursor: 'pointer', fontSize: 12 }}>Response</summary>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: 11,
                        bgcolor: 'grey.100',
                        p: 1.5,
                        borderRadius: 0.5,
                        overflow: 'auto',
                        maxHeight: 200,
                        m: 0,
                        mt: 0.5,
                      }}
                    >
                      {JSON.stringify(a.rawResponse, null, 2)}
                    </Box>
                  </details>
                )}
              </Box>
            ))}
            {attempts && attempts.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Sin intentos registrados.
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

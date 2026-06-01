import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ReplayIcon from '@mui/icons-material/Replay';
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
import { outboxApi } from '../../api/outbox-api';

type Props = { open: boolean; onClose: () => void; deliveryId: string };

export const OutboxDeliveryDialog = ({ open, onClose, deliveryId }: Props) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['outbox', 'deliveries', deliveryId],
    queryFn: () => outboxApi.getDelivery(deliveryId),
    enabled: open,
  });

  const replay = useMutation({
    mutationFn: () => outboxApi.replay(deliveryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outbox', 'deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['outbox', 'deliveries', deliveryId] });
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Delivery <code style={{ fontSize: '0.85em' }}>{deliveryId.slice(0, 8)}…</code>
        {data && (
          <StatusChip variant="outbox" status={data.delivery.status} />
        )}
      </DialogTitle>
      <DialogContent>
        {isLoading && (
          <Stack alignItems="center" sx={{ p: 4 }}>
            <CircularProgress />
          </Stack>
        )}
        {isError && <Alert severity="error">No se pudo cargar el detalle.</Alert>}
        {data && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Evento
                </Typography>
                <Typography>{data.event.eventKind}</Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Aggregate
                </Typography>
                <Typography>
                  {data.event.aggregateType} · <code>{data.event.aggregateId.slice(0, 8)}…</code>
                </Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Target
                </Typography>
                <Typography>{data.delivery.targetDescriptor ?? data.delivery.targetType}</Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Intentos
                </Typography>
                <Typography>{data.delivery.attempts}</Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Próximo intento
                </Typography>
                <Typography>
                  {data.delivery.nextAttemptAt
                    ? new Date(data.delivery.nextAttemptAt).toLocaleString('es-VE')
                    : '—'}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            {(data.delivery.lastErrorMessage || data.delivery.lastResponseStatus) && (
              <Alert severity={data.delivery.status === 'giving_up' ? 'error' : 'warning'}>
                <Typography variant="caption" component="div">
                  HTTP {data.delivery.lastResponseStatus ?? '—'}{' '}
                  {data.delivery.lastErrorCode ? `· ${data.delivery.lastErrorCode}` : ''}
                </Typography>
                {data.delivery.lastErrorMessage && (
                  <Box component="pre" sx={{ fontSize: 11, mt: 1, m: 0, whiteSpace: 'pre-wrap' }}>
                    {data.delivery.lastErrorMessage}
                  </Box>
                )}
                {data.delivery.lastResponseBody && (
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 12 }}>Response body</summary>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: 11,
                        bgcolor: 'grey.50',
                        p: 1,
                        mt: 0.5,
                        borderRadius: 0.5,
                        overflow: 'auto',
                        maxHeight: 200,
                        m: 0,
                      }}
                    >
                      {data.delivery.lastResponseBody}
                    </Box>
                  </details>
                )}
              </Alert>
            )}

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Payload del evento
              </Typography>
              <Box
                component="pre"
                sx={{
                  fontSize: 11,
                  bgcolor: 'grey.100',
                  p: 1.5,
                  borderRadius: 0.5,
                  overflow: 'auto',
                  maxHeight: 320,
                  m: 0,
                }}
              >
                {JSON.stringify(data.event.payload, null, 2)}
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Delivery key: <code>{data.event.deliveryKey}</code>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Emitido: {new Date(data.event.createdAt).toLocaleString('es-VE')}
              </Typography>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {data && (data.delivery.status === 'giving_up' || data.delivery.status === 'pending') && (
          <Button
            startIcon={<ReplayIcon />}
            onClick={() => replay.mutate()}
            disabled={replay.isPending}
            color="warning"
          >
            {replay.isPending ? 'Reintentando…' : 'Reintentar'}
          </Button>
        )}
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import VisibilityIcon from '@mui/icons-material/Visibility';
import WebhookIcon from '@mui/icons-material/Webhook';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import {
  Box,
  Card,
  Table,
  Stack,
  Alert,
  Select,
  Snackbar,
  Skeleton,
  MenuItem,
  TableRow,
  Tooltip,
  TableCell,
  TableHead,
  TableBody,
  InputLabel,
  FormControl,
  IconButton,
  TableContainer,
  Typography,
} from '@mui/material';

import { StatusChip } from '@/shared/ui/status-chip';
import { thSx, filterBarSx } from '@/shared/ui/table-styles';
import { applicationsApi } from '@/features/applications/api/applications-api';
import { PageHeader } from '@/shared/ui/page-header';
import { subscriptionsApi, type SubscriptionStatus } from '../../api/subscriptions-api';

const SubscriptionsPage = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>('');
  const [applicationId, setApplicationId] = useState<string>('');
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false, msg: '', severity: 'success',
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => subscriptionsApi.resendWebhook(id),
    onSuccess: (data) => {
      setSnack({
        open: true,
        msg: data.deliveryIds.length > 0
          ? `Webhook encolado (${data.deliveryIds.length} entrega). Llegará en segundos.`
          : 'No hay suscriptores configurados para esta aplicación. Registra el webhook en la aplicación primero.',
        severity: data.deliveryIds.length > 0 ? 'success' : 'error',
      });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (err: Error) => setSnack({ open: true, msg: err.message, severity: 'error' }),
  });

  const { data: apps } = useQuery({ queryKey: ['applications'], queryFn: () => applicationsApi.list() });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscriptions', { status, applicationId }],
    queryFn: () =>
      subscriptionsApi.list({
        status: (status || undefined) as SubscriptionStatus | undefined,
        applicationId: applicationId || undefined,
      }),
  });

  const appLabel = (id: string) => {
    const a = apps?.find((x) => x.id === id);
    return a ? `${a.name} (${a.slug})` : `${id.slice(0, 8)}…`;
  };

  return (
    <Box>
      <PageHeader
        title="Suscripciones"
        subtitle="Renovación asistida — Sitef no soporta auto-charge. El cron emite renewal_due 7/3/1 días antes."
      />

      <Card variant="outlined">
        {/* Filter bar */}
        <Box sx={filterBarSx}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Estado</InputLabel>
            <Select label="Estado" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="trialing">En prueba</MenuItem>
              <MenuItem value="active">Activa</MenuItem>
              <MenuItem value="past_due">Vencida</MenuItem>
              <MenuItem value="canceling">Cancelando</MenuItem>
              <MenuItem value="canceled">Cancelada</MenuItem>
              <MenuItem value="unpaid">Sin pagar</MenuItem>
              <MenuItem value="paused">Pausada</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Aplicación</InputLabel>
            <Select label="Aplicación" value={applicationId} onChange={(e) => setApplicationId(e.target.value)}>
              <MenuItem value="">Todas</MenuItem>
              {apps?.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {data && (
            <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
              {data.length} resultado{data.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {isError && <Alert severity="error" sx={{ m: 2.5 }}>Error cargando suscripciones.</Alert>}

        {isLoading && (
          <Box sx={{ px: 2.5, py: 2 }}>
            <Stack spacing={1.5}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={42} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          </Box>
        )}

        {!isLoading && data?.length === 0 && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 8 }}>
            <SubscriptionsIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Box textAlign="center">
              <Typography variant="subtitle2" fontWeight={600}>Sin suscripciones</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                No hay suscripciones para los filtros seleccionados.
              </Typography>
            </Box>
          </Stack>
        )}

        {!isLoading && data && data.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                  <TableCell sx={thSx}>ID</TableCell>
                  <TableCell sx={thSx}>Aplicación</TableCell>
                  <TableCell sx={thSx}>Estado</TableCell>
                  <TableCell sx={thSx}>Ciclo</TableCell>
                  <TableCell sx={thSx}>Vencimiento</TableCell>
                  <TableCell sx={thSx}>Ref. externa</TableCell>
                  <TableCell sx={{ ...thSx, width: 88 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((s) => (
                  <TableRow key={s.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600 }}>
                        {s.id.slice(0, 8)}…
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {appLabel(s.applicationId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip variant="subscription" status={s.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {s.billingCycle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(s.currentPeriodEnd).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {s.externalSubscriptionId ? `${s.externalSubscriptionId.slice(0, 12)}…` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Re-enviar webhook subscription.renewed">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => resendMutation.mutate(s.id)}
                              disabled={resendMutation.isPending}
                              sx={{ color: s.status === 'active' ? 'warning.main' : 'text.disabled' }}
                            >
                              <WebhookIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <IconButton size="small" component={RouterLink} to={`/subscriptions/${s.id}`} sx={{ color: 'text.secondary' }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubscriptionsPage;

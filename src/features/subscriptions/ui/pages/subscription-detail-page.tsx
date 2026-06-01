import { useParams, Link as RouterLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  Button,
  Divider,
  Typography,
  CardContent,
  CircularProgress,
} from '@mui/material';

import { StatusChip } from '@/shared/ui/status-chip';
import { PageHeader } from '@/shared/ui/page-header';
import { productsApi } from '@/features/products/api/products-api';
import { customersApi } from '@/features/customers/api/customers-api';
import { applicationsApi } from '@/features/applications/api/applications-api';
import { subscriptionsApi } from '../../api/subscriptions-api';

const EVENT_LABEL: Record<string, string> = {
  created: 'Creada',
  renewed: 'Renovada',
  plan_changed: 'Plan cambiado',
  grace_period_started: 'Periodo de gracia',
  past_due: 'Past due',
  downgraded: 'Downgrade',
  canceled: 'Cancelada',
  reactivated: 'Reactivada',
  trial_ended: 'Trial terminado',
  renewal_due: 'Renovación próxima',
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Typography variant="overline" color="text.secondary" sx={{ display: 'block' }}>
      {label}
    </Typography>
    <Typography variant="body2">{value ?? '—'}</Typography>
  </Box>
);

const SubscriptionDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: sub, isLoading, isError } = useQuery({
    queryKey: ['subscriptions', id],
    queryFn: () => subscriptionsApi.findById(id!),
    enabled: !!id,
  });

  const { data: events } = useQuery({
    queryKey: ['subscriptions', id, 'events'],
    queryFn: () => subscriptionsApi.listEvents(id!),
    enabled: !!id,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.list(),
  });
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
  });
  const { data: apps } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list(),
  });

  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ p: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (isError || !sub) {
    return <Alert severity="error">No se pudo cargar la suscripción.</Alert>;
  }

  const customer = customers?.find((c) => c.id === sub.customerId);
  const product = products?.find((p) => p.id === sub.productId);
  const app = apps?.find((a) => a.id === sub.applicationId);

  return (
    <Box>
      <PageHeader
        title={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <span>Suscripción</span>
            <StatusChip variant="subscription" status={sub.status} />
          </Stack>
        }
        subtitle={`ID ${sub.id}`}
        actions={
          <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/subscriptions">
            Volver
          </Button>
        }
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Datos generales</Typography>
                <Divider />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field label="Aplicación" value={app ? `${app.name} (${app.slug})` : sub.applicationId} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field
                      label="Cliente"
                      value={customer ? `${customer.fullName} — ${customer.email}` : sub.customerId}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field label="Producto" value={product ? `${product.name} (${product.sku})` : sub.productId} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field label="Ciclo" value={sub.billingCycle} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field
                      label="External subscription"
                      value={sub.externalSubscriptionId ?? '—'}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field label="Creada" value={new Date(sub.createdAt).toLocaleString('es-VE')} />
                  </Grid>
                </Grid>

                <Divider />
                <Typography variant="h6">Periodo y agendamiento</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field
                      label="Periodo actual"
                      value={`${new Date(sub.currentPeriodStart).toLocaleDateString('es-VE')} → ${new Date(
                        sub.currentPeriodEnd,
                      ).toLocaleDateString('es-VE')}`}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field
                      label="Trial termina"
                      value={sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString('es-VE') : '—'}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field
                      label="Periodo de gracia"
                      value={sub.gracePeriodUntil ? new Date(sub.gracePeriodUntil).toLocaleString('es-VE') : '—'}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field
                      label="Cambio agendado"
                      value={
                        sub.scheduledProductId
                          ? `${products?.find((p) => p.id === sub.scheduledProductId)?.name ?? sub.scheduledProductId}` +
                            (sub.scheduledBillingCycle ? ` (${sub.scheduledBillingCycle})` : '')
                          : '—'
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field
                      label="Aplicará desde"
                      value={sub.scheduledAt ? new Date(sub.scheduledAt).toLocaleString('es-VE') : '—'}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Field
                      label="Cancelada"
                      value={
                        sub.canceledAt
                          ? `${new Date(sub.canceledAt).toLocaleString('es-VE')} (${sub.cancelReason ?? 'sin razón'})`
                          : '—'
                      }
                    />
                  </Grid>
                </Grid>

                {sub.metadata && Object.keys(sub.metadata).length > 0 && (
                  <>
                    <Divider />
                    <Typography variant="h6">Metadata</Typography>
                    <Box
                      component="pre"
                      sx={{
                        bgcolor: 'grey.100',
                        p: 1.5,
                        borderRadius: 0.5,
                        fontSize: 12,
                        overflow: 'auto',
                        m: 0,
                      }}
                    >
                      {JSON.stringify(sub.metadata, null, 2)}
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">Timeline ({events?.length ?? 0})</Typography>
                <Divider />
                {!events && <CircularProgress size={20} />}
                {events?.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Sin eventos registrados.
                  </Typography>
                )}
                {events?.map((e) => (
                  <Box
                    key={e.id}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle2">{EVENT_LABEL[e.type] ?? e.type}</Typography>
                      <Chip label={e.triggeredBy} size="small" variant="outlined" />
                    </Stack>
                    {(e.fromStatus || e.toStatus) && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {e.fromStatus ?? '—'} → {e.toStatus ?? '—'}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(e.createdAt).toLocaleString('es-VE')}
                    </Typography>
                    {e.metadata && Object.keys(e.metadata).length > 0 && (
                      <Box
                        component="pre"
                        sx={{
                          fontSize: 10,
                          bgcolor: 'grey.50',
                          p: 1,
                          mt: 0.5,
                          borderRadius: 0.5,
                          overflow: 'auto',
                          maxHeight: 100,
                          m: 0,
                        }}
                      >
                        {JSON.stringify(e.metadata, null, 2)}
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubscriptionDetailPage;

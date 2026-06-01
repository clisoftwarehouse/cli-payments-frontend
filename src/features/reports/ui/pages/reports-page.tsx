import { useQuery } from '@tanstack/react-query';

import DownloadIcon from '@mui/icons-material/Download';
import {
  Box,
  Card,
  Chip,
  Grid,
  Table,
  Stack,
  Alert,
  Button,
  Divider,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  CardContent,
  LinearProgress,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { PageHeader } from '@/shared/ui/page-header';
import { fxApi } from '@/features/fx/api/fx-api';
import { paymentsApi } from '@/features/payments/api/payments-api';
import { invoicesApi } from '@/features/invoices/api/invoices-api';
import { customersApi } from '@/features/customers/api/customers-api';
import { applicationsApi } from '@/features/applications/api/applications-api';
import { subscriptionsApi } from '@/features/subscriptions/api/subscriptions-api';

const KPI = ({
  label,
  value,
  hint,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  loading?: boolean;
}) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Stack spacing={0.5}>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        )}
        {hint && (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        )}
      </Stack>
    </CardContent>
  </Card>
);

const fmt = (n: number, currency?: string) => {
  const s = n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${s} ${currency}` : s;
};

const downloadCsv = (rows: string[][], filename: string) => {
  const content = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ReportsPage = () => {
  const { data: invoices, isLoading: invLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.list(),
  });
  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.list(),
  });
  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.list(),
  });
  const { data: apps } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list(),
  });
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.list(),
  });
  const eurRate = useQuery({ queryKey: ['fx', 'latest', 'EUR'], queryFn: () => fxApi.latest('EUR') });

  const appName = (id: string) => apps?.find((a) => a.id === id)?.name ?? id.slice(0, 8) + '…';
  const customerName = (id: string) => {
    const c = customers?.find((x) => x.id === id);
    return c ? c.fullName || c.email : id.slice(0, 8) + '…';
  };

  const paidInvoices = invoices?.filter((i) => i.status === 'paid') ?? [];
  const openInvoices = invoices?.filter((i) => i.status === 'open') ?? [];

  // --- MRR / ARR ---
  const activeSubs = subscriptions?.filter((s) => s.status === 'active' || s.status === 'trialing') ?? [];

  // Each subscription's recurring amount = product price — we don't have it directly,
  // so we approximate from the last paid invoice for that sub's customerId.
  // Better proxy: sum of paid invoices in the last 30 days extrapolated (common for early-stage).
  // We'll use a direct derivation: group paid invoices by billing period (monthly).
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const last30Paid = paidInvoices.filter((i) => i.paidAt && i.paidAt >= thirtyDaysAgo);
  const mrrEur = last30Paid.reduce((s, i) => {
    if (i.displayCurrency === 'EUR') return s + Number(i.displayAmount);
    return s;
  }, 0);

  // --- Ingresos totales por divisa ---
  const incomeByCurrency = paidInvoices.reduce<Record<string, number>>((acc, i) => {
    const c = i.displayCurrency;
    acc[c] = (acc[c] ?? 0) + Number(i.displayAmount);
    return acc;
  }, {});

  // --- Ingresos por aplicación ---
  const incomeByApp = paidInvoices.reduce<Record<string, { eur: number; usd: number; count: number }>>(
    (acc, i) => {
      if (!acc[i.applicationId]) acc[i.applicationId] = { eur: 0, usd: 0, count: 0 };
      if (i.displayCurrency === 'EUR') acc[i.applicationId].eur += Number(i.displayAmount);
      else if (i.displayCurrency === 'USD') acc[i.applicationId].usd += Number(i.displayAmount);
      acc[i.applicationId].count++;
      return acc;
    },
    {},
  );
  const incomeByAppRows = Object.entries(incomeByApp)
    .map(([id, v]) => ({ id, ...v, total: v.eur }))
    .sort((a, b) => b.total - a.total);
  const maxAppIncome = Math.max(...incomeByAppRows.map((r) => r.total), 1);

  // --- Top clientes por LTV ---
  const ltvByCustomer = paidInvoices.reduce<Record<string, { eur: number; count: number }>>((acc, i) => {
    if (!acc[i.customerId]) acc[i.customerId] = { eur: 0, count: 0 };
    if (i.displayCurrency === 'EUR') acc[i.customerId].eur += Number(i.displayAmount);
    acc[i.customerId].count++;
    return acc;
  }, {});
  const topCustomers = Object.entries(ltvByCustomer)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.eur - a.eur)
    .slice(0, 10);
  const maxLtv = Math.max(...topCustomers.map((r) => r.eur), 1);

  // --- Ingresos por mes (últimos 12 meses) ---
  const monthlyIncome: Record<string, { eur: number; count: number }> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyIncome[key] = { eur: 0, count: 0 };
  }
  for (const inv of paidInvoices) {
    if (!inv.paidAt) continue;
    const d = new Date(inv.paidAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in monthlyIncome) {
      if (inv.displayCurrency === 'EUR') monthlyIncome[key].eur += Number(inv.displayAmount);
      monthlyIncome[key].count++;
    }
  }
  const monthlyRows = Object.entries(monthlyIncome);
  const maxMonthly = Math.max(...monthlyRows.map(([, v]) => v.eur), 1);

  // --- Salud de suscripciones ---
  const subsByStatus = (subscriptions ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});
  const totalSubs = (subscriptions ?? []).length;
  const churnableStatuses = ['active', 'trialing', 'past_due', 'paused', 'unpaid', 'canceled'];
  const canceledCount = subsByStatus['canceled'] ?? 0;
  const revenueBase = churnableStatuses.reduce((s, st) => s + (subsByStatus[st] ?? 0), 0);
  const churnRate = revenueBase > 0 ? (canceledCount / revenueBase) * 100 : 0;

  // --- Pagos por estado ---
  const paymentsByStatus = (payments ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});
  const successRate =
    (payments ?? []).length > 0
      ? (((paymentsByStatus['succeeded'] ?? 0) / (payments ?? []).length) * 100).toFixed(1)
      : '—';

  const isLoading = invLoading || subsLoading;

  const handleExportIngresos = () => {
    if (!paidInvoices.length) return;
    const header = ['Número', 'Aplicación', 'Cliente', 'Moneda', 'Importe', 'Pagada el'];
    const rows = paidInvoices.map((i) => [
      i.number ?? '',
      appName(i.applicationId),
      customerName(i.customerId),
      i.displayCurrency,
      String(Number(i.displayAmount).toFixed(2)),
      i.paidAt ? new Date(i.paidAt).toLocaleDateString('es-VE') : '',
    ]);
    downloadCsv([header, ...rows], 'cli-payments-ingresos.csv');
  };

  const handleExportSuscripciones = () => {
    if (!subscriptions?.length) return;
    const header = ['ID', 'Aplicación', 'Cliente', 'Estado', 'Ciclo', 'Vence'];
    const rows = subscriptions.map((s) => [
      s.id,
      appName(s.applicationId),
      customerName(s.customerId),
      s.status,
      s.billingCycle,
      new Date(s.currentPeriodEnd).toLocaleDateString('es-VE'),
    ]);
    downloadCsv([header, ...rows], 'cli-payments-suscripciones.csv');
  };

  const SUB_STATUS_COLORS: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    active: 'success',
    trialing: 'info',
    past_due: 'warning',
    unpaid: 'error',
    paused: 'default',
    canceling: 'warning',
    canceled: 'default',
  };

  const SUB_STATUS_LABEL: Record<string, string> = {
    active: 'Activa',
    trialing: 'En prueba',
    past_due: 'Vencida',
    unpaid: 'Sin pagar',
    paused: 'Pausada',
    canceling: 'Cancelando',
    canceled: 'Cancelada',
  };

  return (
    <Box>
      <PageHeader
        title="Reportes"
        subtitle="MRR estimado, ingresos por aplicación, top clientes por LTV, salud de suscripciones. Datos basados en los últimos registros."
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              variant="outlined"
              onClick={handleExportIngresos}
              disabled={!paidInvoices.length}
            >
              Exportar ingresos CSV
            </Button>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              variant="outlined"
              onClick={handleExportSuscripciones}
              disabled={!subscriptions?.length}
            >
              Exportar suscripciones CSV
            </Button>
          </Stack>
        }
      />

      {isLoading && (
        <Stack alignItems="center" sx={{ p: 6 }}>
          <CircularProgress />
        </Stack>
      )}

      {!isLoading && (
        <Stack spacing={3}>
          {/* KPIs */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPI
                label="MRR estimado (últimos 30 días)"
                value={`${fmt(mrrEur)} EUR`}
                hint={`ARR ≈ ${fmt(mrrEur * 12)} EUR`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPI
                label="Ingresos totales (EUR)"
                value={fmt(incomeByCurrency['EUR'] ?? 0)}
                hint={`${paidInvoices.length} factura(s) pagada(s)`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPI
                label="Suscripciones activas"
                value={activeSubs.length}
                hint={`${totalSubs} totales`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPI
                label="Tasa de éxito de pagos"
                value={successRate === '—' ? '—' : `${successRate}%`}
                hint={`${payments?.length ?? 0} intentos totales`}
              />
            </Grid>
          </Grid>

          {/* Ingresos mensuales */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Ingresos por mes (EUR)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Últimos 12 meses — basado en facturas pagadas
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              {monthlyRows.every(([, v]) => v.eur === 0) ? (
                <Alert severity="info" variant="outlined">
                  Aún no hay facturas pagadas en los últimos 12 meses.
                </Alert>
              ) : (
                <Stack spacing={1}>
                  {monthlyRows.map(([month, v]) => (
                    <Box key={month}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
                        <Typography variant="caption" sx={{ minWidth: 70 }}>
                          {month}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                          {v.count} fac.
                        </Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ minWidth: 100, textAlign: 'right' }}>
                          {fmt(v.eur)} EUR
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(v.eur / maxMonthly) * 100}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={2.5}>
            {/* Ingresos por aplicación */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Ingresos por aplicación
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Facturas pagadas acumuladas
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  {incomeByAppRows.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                      Sin ingresos registrados todavía.
                    </Alert>
                  ) : (
                    <Stack spacing={1.5}>
                      {incomeByAppRows.map((r) => (
                        <Box key={r.id}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                              {appName(r.id)}
                            </Typography>
                            <Typography variant="caption" fontWeight={600}>
                              {fmt(r.eur)} EUR
                              {r.usd > 0 && (
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {' '}+ {fmt(r.usd)} USD
                                </Typography>
                              )}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={(r.eur / maxAppIncome) * 100}
                            sx={{ height: 6, borderRadius: 1 }}
                            color="secondary"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {r.count} factura(s)
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Top clientes LTV */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Top 10 clientes por LTV
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Suma de facturas pagadas en EUR
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  {topCustomers.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                      Sin datos de LTV todavía.
                    </Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell align="right">LTV (EUR)</TableCell>
                            <TableCell align="right">Facturas</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {topCustomers.map((c, idx) => (
                            <TableRow key={c.id} hover>
                              <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                                    {customerName(c.id)}
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(c.eur / maxLtv) * 100}
                                    sx={{ height: 4, borderRadius: 1, mt: 0.25 }}
                                    color="success"
                                  />
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={600}>
                                  {fmt(c.eur)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">{c.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Salud de suscripciones */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Salud de suscripciones
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Churn proxy: canceladas / (activas + canceladas + resto)
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack spacing={1.5}>
                    {churnableStatuses.map((st) => {
                      const count = subsByStatus[st] ?? 0;
                      if (!count && st !== 'active') return null;
                      return (
                        <Stack key={st} direction="row" justifyContent="space-between" alignItems="center">
                          <Chip
                            label={SUB_STATUS_LABEL[st] ?? st}
                            size="small"
                            color={SUB_STATUS_COLORS[st] ?? 'default'}
                          />
                          <Typography variant="body2" fontWeight={600}>
                            {count}
                          </Typography>
                        </Stack>
                      );
                    })}
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Churn proxy
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={churnRate > 20 ? 'error.main' : churnRate > 10 ? 'warning.main' : 'success.main'}
                      >
                        {churnRate.toFixed(1)}%
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Pagos por estado */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Distribución de pagos por estado
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sobre todos los intentos registrados
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  {!payments?.length ? (
                    <Alert severity="info" variant="outlined">
                      Sin pagos registrados todavía.
                    </Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Cantidad</TableCell>
                            <TableCell align="right">% del total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(paymentsByStatus)
                            .sort(([, a], [, b]) => b - a)
                            .map(([status, count]) => {
                              const LABELS: Record<string, string> = {
                                pending: 'Pendiente',
                                requires_otp: 'Requiere OTP',
                                requires_action: 'Requiere acción',
                                succeeded: 'Exitoso',
                                failed: 'Fallido',
                                canceled: 'Cancelado',
                              };
                              const COLORS: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
                                pending: 'info',
                                requires_otp: 'warning',
                                requires_action: 'warning',
                                succeeded: 'success',
                                failed: 'error',
                                canceled: 'default',
                              };
                              return (
                                <TableRow key={status}>
                                  <TableCell>
                                    <Chip
                                      label={LABELS[status] ?? status}
                                      size="small"
                                      color={COLORS[status] ?? 'default'}
                                    />
                                  </TableCell>
                                  <TableCell align="right">{count}</TableCell>
                                  <TableCell align="right">
                                    {(((count as number) / (payments?.length ?? 1)) * 100).toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          <TableRow>
                            <TableCell>
                              <strong>Total</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>{payments.length}</strong>
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Facturas pendientes de cobro */}
          {openInvoices.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  Facturas abiertas pendientes de cobro
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {openInvoices.length} factura(s) en estado &quot;Abierta&quot; sin pago exitoso
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Número</TableCell>
                        <TableCell>Aplicación</TableCell>
                        <TableCell align="right">Importe</TableCell>
                        <TableCell>Vencimiento</TableCell>
                        <TableCell>Emitida</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {openInvoices
                        .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
                        .map((inv) => (
                          <TableRow
                            key={inv.id}
                            hover
                            sx={{
                              bgcolor:
                                inv.dueDate && new Date(inv.dueDate) < now ? 'error.50' : undefined,
                            }}
                          >
                            <TableCell>
                              <code style={{ fontSize: '0.85em' }}>{inv.number ?? inv.id.slice(0, 8)}</code>
                            </TableCell>
                            <TableCell>{appName(inv.applicationId)}</TableCell>
                            <TableCell align="right">
                              {fmt(Number(inv.displayAmount))} {inv.displayCurrency}
                            </TableCell>
                            <TableCell>
                              {inv.dueDate ? (
                                <Typography
                                  variant="body2"
                                  color={new Date(inv.dueDate) < now ? 'error' : 'inherit'}
                                >
                                  {new Date(inv.dueDate).toLocaleDateString('es-VE')}
                                </Typography>
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell>{new Date(inv.createdAt).toLocaleDateString('es-VE')}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {eurRate.data && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
              Tasa BCV referencial: 1 EUR = {Number(eurRate.data.rate).toLocaleString('es-VE', { minimumFractionDigits: 4 })} VES
              · Fuente: {eurRate.data.source}
              · {new Date(eurRate.data.effectiveDate).toLocaleDateString('es-VE')}
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default ReportsPage;

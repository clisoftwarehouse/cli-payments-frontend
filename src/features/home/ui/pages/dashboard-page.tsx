import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { StatusChip } from '@/shared/ui/status-chip';
import { fxApi } from '@/features/fx/api/fx-api';
import { outboxApi } from '@/features/outbox/api/outbox-api';
import { paymentsApi, type PaymentDto } from '@/features/payments/api/payments-api';
import { invoicesApi, type InvoiceDto } from '@/features/invoices/api/invoices-api';
import { customersApi } from '@/features/customers/api/customers-api';
import { applicationsApi } from '@/features/applications/api/applications-api';
import { subscriptionsApi } from '@/features/subscriptions/api/subscriptions-api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = '1d' | '7d' | '30d' | '90d';

const PERIOD_CONFIG: Record<Period, { label: string; days: number; prevLabel: string }> = {
  '1d': { label: 'Hoy', days: 1, prevLabel: 'vs ayer' },
  '7d': { label: '7D', days: 7, prevLabel: 'vs sem. ant.' },
  '30d': { label: '30D', days: 30, prevLabel: 'vs mes ant.' },
  '90d': { label: '90D', days: 90, prevLabel: 'vs trim. ant.' },
};

const METHOD_COLORS: Record<string, string> = {
  c2p: '#1877F2',
  transfer: '#FFAB00',
  pago_movil: '#00B8D9',
  web_button: '#22C55E',
  card_ccr: '#FF6B2B',
  zelle: '#8E33FF',
};

const METHOD_LABEL: Record<string, string> = {
  c2p: 'C2P',
  transfer: 'Transferencia',
  pago_movil: 'Pago Móvil',
  web_button: 'Tarjeta',
  card_ccr: 'Credicard',
  zelle: 'Zelle',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getSince = (days: number): Date => {
  const d = new Date();
  if (days === 1) {
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
  }
  return d;
};

const getPrevSince = (days: number): Date => {
  const d = getSince(days);
  d.setDate(d.getDate() - (days === 1 ? 1 : days));
  return d;
};

const getRevenueSeries = (invoices: InvoiceDto[], days: number): { date: string; eur: number }[] => {
  const result: Record<string, number> = {};
  const since = getSince(days);
  const now = new Date();

  if (days === 1) {
    for (let h = 0; h < 24; h++) {
      result[`${h.toString().padStart(2, '0')}:00`] = 0;
    }
    for (const inv of invoices) {
      if (inv.status !== 'paid' || !inv.paidAt) continue;
      const d = new Date(inv.paidAt);
      if (d < since) continue;
      const key = `${d.getHours().toString().padStart(2, '0')}:00`;
      if (key in result) result[key] += Number(inv.displayAmount);
    }
  } else {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
      result[key] = 0;
    }
    for (const inv of invoices) {
      if (inv.status !== 'paid' || !inv.paidAt) continue;
      const d = new Date(inv.paidAt);
      if (d < since) continue;
      const key = d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
      if (key in result) result[key] += Number(inv.displayAmount);
    }
  }

  return Object.entries(result).map(([date, eur]) => ({ date, eur }));
};

const getMethodData = (payments: PaymentDto[], since: Date) => {
  const counts: Record<string, number> = {};
  for (const p of payments) {
    if (new Date(p.createdAt) < since) continue;
    counts[p.methodKind] = (counts[p.methodKind] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([method, count]) => ({
      name: METHOD_LABEL[method] ?? method,
      value: count,
      color: METHOD_COLORS[method] ?? '#919EAB',
    }))
    .sort((a, b) => b.value - a.value);
};

const getRevTrend = (invoices: InvoiceDto[], since: Date, prevSince: Date) => {
  const current = invoices
    .filter((i) => i.status === 'paid' && i.paidAt && new Date(i.paidAt) >= since)
    .reduce((s, i) => s + Number(i.displayAmount), 0);
  const previous = invoices
    .filter((i) => i.status === 'paid' && i.paidAt && new Date(i.paidAt) >= prevSince && new Date(i.paidAt) < since)
    .reduce((s, i) => s + Number(i.displayAmount), 0);
  const pct = previous > 0 ? ((current - previous) / previous) * 100 : null;
  return { current, pct };
};

const getPayTrend = (payments: PaymentDto[], since: Date, prevSince: Date) => {
  const cur = payments.filter((p) => new Date(p.createdAt) >= since);
  const prev = payments.filter((p) => new Date(p.createdAt) >= prevSince && new Date(p.createdAt) < since);
  const curOk = cur.filter((p) => p.status === 'succeeded').length;
  const prevOk = prev.filter((p) => p.status === 'succeeded').length;
  const pct = prevOk > 0 ? ((curOk - prevOk) / prevOk) * 100 : null;
  const curSettled = cur.filter((p) => p.status === 'succeeded' || p.status === 'failed').length;
  const successRate = curSettled > 0 ? (curOk / curSettled) * 100 : null;
  return { ok: curOk, pct, successRate };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const TrendBadge = ({ pct, prevLabel }: { pct: number | null; prevLabel: string }) => {
  if (pct === null)
    return (
      <Typography variant="caption" color="text.disabled">
        Sin datos anteriores
      </Typography>
    );
  const up = pct >= 0;
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {up ? (
        <ArrowUpwardIcon sx={{ fontSize: 12, color: 'success.main' }} />
      ) : (
        <ArrowDownwardIcon sx={{ fontSize: 12, color: 'error.main' }} />
      )}
      <Typography variant="caption" fontWeight={600} color={up ? 'success.main' : 'error.main'}>
        {up ? '+' : ''}
        {pct.toFixed(1)}%
      </Typography>
      <Typography variant="caption" color="text.disabled">
        {prevLabel}
      </Typography>
    </Stack>
  );
};

type KpiProps = {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
  trend?: React.ReactNode;
  accentColor?: string;
  icon?: React.ReactNode;
};

const KpiCard = ({ label, value, loading, trend, accentColor, icon }: KpiProps) => (
  <Card
    variant="outlined"
    sx={{ height: '100%', borderTop: '3px solid', borderTopColor: accentColor ?? 'primary.main' }}
  >
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11 }}>
          {label}
        </Typography>
        {icon && (
          <Box sx={{ color: accentColor ?? 'primary.main', display: 'flex', alignItems: 'center', opacity: 0.7 }}>
            {icon}
          </Box>
        )}
      </Stack>
      {loading ? (
        <Skeleton variant="text" width={80} height={48} />
      ) : (
        <Typography variant="h4" fontWeight={800} lineHeight={1} sx={{ mb: 1 }}>
          {value}
        </Typography>
      )}
      {trend}
    </CardContent>
  </Card>
);

const SectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{ px: 2.5, py: 1.75, borderBottom: (t) => `1px solid ${t.palette.divider}` }}
  >
    <Typography variant="subtitle1" fontWeight={700}>
      {title}
    </Typography>
    {action}
  </Stack>
);

const RevenueTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={8} sx={{ px: 2, py: 1.5, borderRadius: 2, minWidth: 140 }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {payload[0].value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
      </Typography>
    </Paper>
  );
};

const MethodTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={8} sx={{ px: 2, py: 1.5, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: payload[0].payload.color }} />
        <Typography variant="body2" fontWeight={600}>
          {payload[0].name}: {payload[0].value} pago{payload[0].value !== 1 ? 's' : ''}
        </Typography>
      </Stack>
    </Paper>
  );
};

const fmtVes = (n: number) =>
  n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const fmtDateShort = (iso: string) =>
  new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Main page ────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const theme = useTheme();
  const [period, setPeriod] = useState<Period>('7d');
  const cfg = PERIOD_CONFIG[period];

  const since = useMemo(() => getSince(cfg.days), [cfg.days]);
  const prevSince = useMemo(() => getPrevSince(cfg.days), [cfg.days]);

  const { data: invoices, isLoading: invLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.list(),
  });
  const { data: payments, isLoading: payLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.list(),
  });
  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsApi.list(),
  });
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: () => customersApi.list() });
  const { data: apps } = useQuery({ queryKey: ['applications'], queryFn: () => applicationsApi.list() });
  const { data: failedDeliveries } = useQuery({
    queryKey: ['outbox', 'deliveries', { status: 'giving_up' }],
    queryFn: () => outboxApi.listDeliveries({ status: 'giving_up' }),
  });
  const eurRate = useQuery({ queryKey: ['fx', 'latest', 'EUR'], queryFn: () => fxApi.latest('EUR') });
  const usdRate = useQuery({ queryKey: ['fx', 'latest', 'USD'], queryFn: () => fxApi.latest('USD') });

  // ─── Derived data ──────────────────────────────────────────────────────────

  const revSeries = useMemo(
    () => (invoices ? getRevenueSeries(invoices, cfg.days) : []),
    [invoices, cfg.days],
  );

  const { current: revenue, pct: revPct } = useMemo(
    () => (invoices ? getRevTrend(invoices, since, prevSince) : { current: 0, pct: null }),
    [invoices, since, prevSince],
  );

  const { ok: paymentsOk, pct: payPct, successRate } = useMemo(
    () => (payments ? getPayTrend(payments, since, prevSince) : { ok: 0, pct: null, successRate: null }),
    [payments, since, prevSince],
  );

  const methodData = useMemo(
    () => (payments ? getMethodData(payments, since) : []),
    [payments, since],
  );

  const recentPayments = useMemo(
    () => [...(payments ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    [payments],
  );

  const activeSubs = subscriptions?.filter((s) => s.status === 'active' || s.status === 'trialing').length ?? 0;

  const next7d = new Date();
  next7d.setDate(next7d.getDate() + 7);
  const upcomingRenewals =
    subscriptions?.filter(
      (s) => (s.status === 'active' || s.status === 'trialing') && new Date(s.currentPeriodEnd) <= next7d,
    ) ?? [];

  const primaryColor = theme.palette.primary.main;
  const tickColor = theme.palette.text.disabled;
  const gridColor = theme.palette.divider;

  const hasRevData = revSeries.some((d) => d.eur > 0);

  return (
    <Box>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} lineHeight={1.2} color="text.primary">
            Panel principal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {new Date().toLocaleDateString('es-VE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, v) => v && setPeriod(v)}
          size="small"
          sx={{ '& .MuiToggleButton-root': { px: 2, py: 0.75, fontSize: 12, fontWeight: 600 } }}
        >
          {Object.entries(PERIOD_CONFIG).map(([value, { label }]) => (
            <ToggleButton key={value} value={value}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
      <Divider sx={{ mb: 3 }} />

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Ingresos del período"
            accentColor={theme.palette.primary.main}
            loading={invLoading}
            value={`€${fmtVes(revenue)}`}
            trend={<TrendBadge pct={revPct} prevLabel={cfg.prevLabel} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Pagos exitosos"
            accentColor={theme.palette.success.main}
            loading={payLoading}
            value={paymentsOk}
            trend={<TrendBadge pct={payPct} prevLabel={cfg.prevLabel} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Tasa de éxito"
            accentColor={theme.palette.info.main}
            loading={payLoading}
            value={successRate !== null ? `${successRate.toFixed(1)}%` : '—'}
            trend={
              <Typography variant="caption" color="text.disabled">
                Pagos completados vs intentados
              </Typography>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            label="Suscripciones activas"
            accentColor={theme.palette.warning.main}
            value={activeSubs}
            trend={
              <Stack direction="row" spacing={1.5}>
                {failedDeliveries && failedDeliveries.length > 0 && (
                  <Chip
                    size="small"
                    label={`${failedDeliveries.length} webhook fallido${failedDeliveries.length !== 1 ? 's' : ''}`}
                    color="error"
                    sx={{ height: 20, fontSize: 11, fontWeight: 600 }}
                  />
                )}
                <Typography variant="caption" color="text.disabled">
                  {customers?.length ?? 0} clientes · {apps?.filter((a) => a.isActive).length ?? 0} apps
                </Typography>
              </Stack>
            }
          />
        </Grid>
      </Grid>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Revenue chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <SectionHeader
              title={`Ingresos EUR · ${cfg.label}`}
              action={
                hasRevData ? (
                  <Typography variant="caption" color="text.secondary">
                    Total:{' '}
                    <Box component="span" fontWeight={700} color="text.primary">
                      €{fmtVes(revenue)}
                    </Box>
                  </Typography>
                ) : null
              }
            />
            <Box sx={{ px: 1, pt: 2, pb: 1, height: 260 }}>
              {invLoading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                  <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
                </Stack>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revSeries} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={primaryColor} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: tickColor }}
                      tickLine={false}
                      axisLine={false}
                      interval={cfg.days === 1 ? 3 : cfg.days <= 7 ? 0 : cfg.days <= 30 ? 4 : 12}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: tickColor }}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tickFormatter={(v: number) => (v === 0 ? '0' : `€${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`)}
                    />
                    <Tooltip content={<RevenueTooltip />} cursor={{ stroke: primaryColor, strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                      type="monotone"
                      dataKey="eur"
                      stroke={primaryColor}
                      strokeWidth={2.5}
                      fill="url(#revGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: primaryColor, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Method distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <SectionHeader title="Métodos de pago" />
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
              {payLoading ? (
                <Stack spacing={1.5}>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={32} sx={{ borderRadius: 1 }} />
                  ))}
                </Stack>
              ) : methodData.length === 0 ? (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.disabled" textAlign="center">
                    Sin pagos en este período
                  </Typography>
                </Stack>
              ) : (
                <>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={methodData}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={84}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {methodData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<MethodTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Stack spacing={0.75} sx={{ mt: 1 }}>
                    {methodData.map((m) => {
                      const total = methodData.reduce((s, x) => s + x.value, 0);
                      const pct = total > 0 ? ((m.value / total) * 100).toFixed(0) : '0';
                      return (
                        <Stack key={m.name} direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: m.color, flexShrink: 0 }} />
                            <Typography variant="caption" color="text.secondary">
                              {m.name}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.disabled">
                              {pct}%
                            </Typography>
                            <Typography variant="caption" fontWeight={700} color="text.primary">
                              {m.value}
                            </Typography>
                          </Stack>
                        </Stack>
                      );
                    })}
                  </Stack>
                </>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2}>
        {/* Recent payments */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <SectionHeader
              title="Últimos pagos"
              action={
                <Link
                  component={RouterLink}
                  to="/payments"
                  variant="caption"
                  color="primary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, textDecoration: 'none' }}
                >
                  Ver todos <OpenInNewIcon sx={{ fontSize: 13 }} />
                </Link>
              }
            />
            {payLoading ? (
              <Box sx={{ p: 2.5 }}>
                <Stack spacing={1.5}>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={38} sx={{ borderRadius: 1 }} />
                  ))}
                </Stack>
              </Box>
            ) : recentPayments.length === 0 ? (
              <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
                <ReceiptLongIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary">
                  Aún no hay pagos registrados
                </Typography>
              </Stack>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Método</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monto</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fecha</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPayments.map((p) => (
                      <TableRow
                        key={p.id}
                        hover
                        sx={{ '&:last-child td': { border: 0 } }}
                      >
                        <TableCell>
                          <Link component={RouterLink} to={`/payments/${p.id}`}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600, color: 'primary.main' }}>
                              {p.id.slice(0, 8)}…
                            </Typography>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusChip variant="payment" status={p.status} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: METHOD_COLORS[p.methodKind] ?? 'text.disabled',
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {METHOD_LABEL[p.methodKind] ?? p.methodKind}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {fmtVes(Number(p.displayAmount))} {p.displayCurrency}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {fmtDate(p.createdAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            {/* FX rates */}
            <Card variant="outlined">
              <SectionHeader title="Tasas BCV" />
              <Box sx={{ p: 2.5 }}>
                <Stack spacing={2} divider={<Divider flexItem />}>
                  {[
                    { label: 'EUR → VES', q: eurRate },
                    { label: 'USD → VES', q: usdRate },
                  ].map(({ label, q }) => (
                    <Box key={label}>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        fontWeight={600}
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10, display: 'block', mb: 0.25 }}
                      >
                        {label}
                      </Typography>
                      {q.isLoading ? (
                        <Skeleton width={100} height={36} />
                      ) : (
                        <Stack direction="row" alignItems="baseline" spacing={1}>
                          <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
                            {q.data
                              ? Number(q.data.rate).toLocaleString('es-VE', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                              : '—'}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {q.data?.source}
                            {q.data ? ` · ${fmtDateShort(q.data.effectiveDate)}` : ''}
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Card>

            {/* Upcoming renewals */}
            <Card variant="outlined">
              <SectionHeader
                title="Renovaciones próximas"
                action={
                  upcomingRenewals.length > 0 ? (
                    <Link
                      component={RouterLink}
                      to="/subscriptions"
                      variant="caption"
                      color="primary"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, textDecoration: 'none' }}
                    >
                      Ver todas <ArrowForwardIcon sx={{ fontSize: 13 }} />
                    </Link>
                  ) : undefined
                }
              />
              {upcomingRenewals.length === 0 ? (
                <Stack alignItems="center" spacing={1} sx={{ py: 3, px: 2 }}>
                  <RefreshIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontSize: 13 }}>
                    Sin renovaciones en los próximos 7 días
                  </Typography>
                </Stack>
              ) : (
                <Stack divider={<Divider />}>
                  {upcomingRenewals.slice(0, 4).map((s) => (
                    <Box
                      key={s.id}
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        transition: 'background 120ms',
                        '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Link
                          component={RouterLink}
                          to={`/subscriptions/${s.id}`}
                          sx={{ fontFamily: 'monospace', fontSize: '0.76rem', fontWeight: 600 }}
                        >
                          {s.id.slice(0, 8)}…
                        </Link>
                        <StatusChip variant="subscription" status={s.status} />
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                        <WarningAmberIcon sx={{ fontSize: 11, color: 'warning.main' }} />
                        <Typography variant="caption" color="text.secondary">
                          Vence {fmtDateShort(s.currentPeriodEnd)} · {s.billingCycle}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

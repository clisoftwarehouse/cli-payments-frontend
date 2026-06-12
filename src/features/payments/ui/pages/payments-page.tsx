import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {
  Box,
  Card,
  Table,
  Stack,
  Alert,
  Select,
  Skeleton,
  MenuItem,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  InputLabel,
  TextField,
  FormControl,
  IconButton,
  InputAdornment,
  TableContainer,
  Typography,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router';

import { StatusChip } from '@/shared/ui/status-chip';
import { thSx, filterBarSx } from '@/shared/ui/table-styles';
import { paymentsApi, type PaymentDto } from '../../api/payments-api';
import { PageHeader } from '@/shared/ui/page-header';
import { PaymentDetailDialog } from '../components/payment-detail-dialog';

const METHOD_LABEL: Record<string, string> = {
  c2p: 'C2P',
  transfer: 'Transferencia',
  pago_movil: 'Pago Móvil',
  web_button: 'Tarjeta',
  card_ccr: 'Credicard',
  zelle: 'Zelle',
  manual: 'Manual',
};

const PaymentsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<PaymentDto | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments', { status: statusFilter }],
    queryFn: () => paymentsApi.list({ status: statusFilter || undefined }),
  });

  const filtered = useMemo(() => {
    if (!data) return undefined;
    const q = search.trim().toLowerCase();
    return data.filter((p) => {
      if (methodFilter && p.methodKind !== methodFilter) return false;
      if (!q) return true;
      return (
        p.id.toLowerCase().includes(q) ||
        (p.gatewayReference ?? '').toLowerCase().includes(q) ||
        p.displayAmount.includes(q) ||
        (p.chargedAmount ?? '').includes(q) ||
        (p.failureCode ?? '').toLowerCase().includes(q)
      );
    });
  }, [data, search, methodFilter]);

  return (
    <Box>
      <PageHeader
        title="Pagos"
        subtitle="Cada pago puede tener N intentos con distintos métodos. El polling worker resuelve los pendientes."
      />

      <Card variant="outlined">
        {/* Filter bar */}
        <Box sx={filterBarSx}>
          <TextField
            size="small"
            placeholder="Buscar por ID, referencia o monto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 240 }, flex: { sm: 1 }, maxWidth: { sm: 380 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 8px)', sm: 160 } }}>
            <InputLabel>Estado</InputLabel>
            <Select label="Estado" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="requires_otp">Requiere OTP</MenuItem>
              <MenuItem value="requires_action">Requiere acción</MenuItem>
              <MenuItem value="succeeded">Exitoso</MenuItem>
              <MenuItem value="failed">Fallido</MenuItem>
              <MenuItem value="canceled">Cancelado</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 8px)', sm: 160 } }}>
            <InputLabel>Método</InputLabel>
            <Select label="Método" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(METHOD_LABEL).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {filtered && (
            <Typography variant="caption" color="text.disabled" sx={{ ml: { sm: 'auto' } }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {isError && <Alert severity="error" sx={{ m: 2.5 }}>Error cargando pagos.</Alert>}

        {isLoading && (
          <Box sx={{ px: 2.5, py: 2 }}>
            <Stack spacing={1.5}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={42} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          </Box>
        )}

        {!isLoading && filtered?.length === 0 && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 8 }}>
            <ReceiptLongIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Box textAlign="center">
              <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
                {search || methodFilter || statusFilter ? 'Sin resultados para los filtros' : 'Sin pagos'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 320 }}>
                {search || methodFilter || statusFilter
                  ? 'Prueba con otro término o limpia los filtros.'
                  : 'Crea una factura, emítela y comparte el link de pago con el cliente.'}
              </Typography>
            </Box>
          </Stack>
        )}

        {!isLoading && filtered && filtered.length > 0 && (
          <TableContainer>
            <Table size="small" sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                  <TableCell sx={thSx}>ID</TableCell>
                  <TableCell sx={thSx}>Estado</TableCell>
                  <TableCell sx={thSx}>Método</TableCell>
                  <TableCell align="right" sx={thSx}>Monto</TableCell>
                  <TableCell align="right" sx={thSx}>Cobrado VES</TableCell>
                  <TableCell sx={thSx}>Ref. gateway</TableCell>
                  <TableCell sx={thSx}>Creado</TableCell>
                  <TableCell sx={{ ...thSx, width: 40 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Link component={RouterLink} to={`/payments/${p.id}`}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600 }}>
                          {p.id.slice(0, 8)}…
                        </Typography>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusChip variant="payment" status={p.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {METHOD_LABEL[p.methodKind] ?? p.methodKind}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {Number(p.displayAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })} {p.displayCurrency}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {p.chargedAmount
                          ? `${Number(p.chargedAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })} ${p.chargedCurrency}`
                          : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {p.gatewayReference ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(p.createdAt).toLocaleString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setDetail(p)} sx={{ color: 'text.secondary' }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {detail && <PaymentDetailDialog open onClose={() => setDetail(null)} payment={detail} />}
    </Box>
  );
};

export default PaymentsPage;

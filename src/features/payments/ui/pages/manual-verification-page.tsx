import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import SearchIcon from '@mui/icons-material/Search';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {
  Box,
  Card,
  Stack,
  Table,
  Alert,
  Button,
  Select,
  Divider,
  Skeleton,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  InputAdornment,
  TableContainer,
} from '@mui/material';

import { PageHeader } from '@/shared/ui/page-header';
import { thSx, filterBarSx } from '@/shared/ui/table-styles';
import { invoicesApi, type InvoiceDto } from '@/features/invoices/api/invoices-api';
import { applicationsApi } from '@/features/applications/api/applications-api';
import { ManualPaymentDialog, type ManualPaymentInvoice } from '../components/manual-payment-dialog';

const fmtMoney = (v: string) => Number(v).toLocaleString('es-VE', { minimumFractionDigits: 2 });
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });

const toDialogInvoice = (inv: InvoiceDto): ManualPaymentInvoice => ({
  id: inv.id,
  number: inv.number,
  displayAmount: inv.displayAmount,
  displayCurrency: inv.displayCurrency,
  chargedAmount: inv.chargedAmount,
  chargedCurrency: inv.chargedCurrency,
});

const ManualVerificationPage = () => {
  const [selected, setSelected] = useState<ManualPaymentInvoice | null>(null);
  const [search, setSearch] = useState('');
  const [appFilter, setAppFilter] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoices', { status: 'open' }],
    queryFn: () => invoicesApi.list({ status: 'open' }),
  });

  const { data: apps } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list(),
  });

  const appName = useMemo(() => {
    const map = new Map<string, string>();
    apps?.forEach((a) => map.set(a.id, a.name));
    return (id: string) => map.get(id) ?? `${id.slice(0, 8)}…`;
  }, [apps]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((inv) => {
      if (appFilter && inv.applicationId !== appFilter) return false;
      if (!q) return true;
      return (
        (inv.number ?? '').toLowerCase().includes(q) ||
        inv.id.toLowerCase().includes(q) ||
        inv.displayAmount.includes(q) ||
        (inv.chargedAmount ?? '').includes(q) ||
        appName(inv.applicationId).toLowerCase().includes(q)
      );
    });
  }, [data, search, appFilter, appName]);

  return (
    <Box>
      <PageHeader
        title="Verificación manual"
        subtitle="Verifica un pago contra Sitef por su referencia, u otorga la factura manualmente (con motivo) cuando el cobro está confirmado por otra vía."
      />

      <Card variant="outlined">
        {/* Barra de búsqueda + filtros */}
        <Box sx={filterBarSx}>
          <TextField
            size="small"
            placeholder="Buscar por número, monto o aplicación…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 280 }, flex: { sm: 1 }, maxWidth: { sm: 420 } }}
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
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>Aplicación</InputLabel>
            <Select label="Aplicación" value={appFilter} onChange={(e) => setAppFilter(e.target.value)}>
              <MenuItem value="">Todas</MenuItem>
              {apps?.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.disabled" sx={{ ml: { sm: 'auto' } }}>
            {filtered.length} factura{filtered.length !== 1 ? 's' : ''} abierta{filtered.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {isError && (
          <Alert severity="error" sx={{ m: 2.5 }}>
            No se pudieron cargar las facturas.
          </Alert>
        )}

        {isLoading && (
          <Stack spacing={1.5} sx={{ p: 2.5 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 8, px: 2, textAlign: 'center' }}>
            <ReceiptLongIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {search || appFilter ? 'Sin resultados para los filtros aplicados' : 'No hay facturas abiertas'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {search || appFilter
                  ? 'Prueba con otro término o limpia los filtros.'
                  : 'Cuando exista una factura pendiente de pago aparecerá aquí.'}
              </Typography>
            </Box>
            {(search || appFilter) && (
              <Button
                size="small"
                onClick={() => {
                  setSearch('');
                  setAppFilter('');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </Stack>
        )}

        {/* Desktop: tabla */}
        {!isLoading && filtered.length > 0 && (
          <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                  <TableCell sx={thSx}>Factura</TableCell>
                  <TableCell sx={thSx}>Aplicación</TableCell>
                  <TableCell align="right" sx={thSx}>
                    Monto
                  </TableCell>
                  <TableCell align="right" sx={thSx}>
                    Equiv. VES
                  </TableCell>
                  <TableCell sx={thSx}>Creada</TableCell>
                  <TableCell align="right" sx={{ ...thSx, width: 180 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                        {inv.number ?? `${inv.id.slice(0, 8)}…`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{appName(inv.applicationId)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {fmtMoney(inv.displayAmount)} {inv.displayCurrency}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {inv.chargedAmount ? `${fmtMoney(inv.chargedAmount)} ${inv.chargedCurrency}` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {fmtDate(inv.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FactCheckIcon />}
                        onClick={() => setSelected(toDialogInvoice(inv))}
                      >
                        Verificar / Otorgar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Móvil: cards apiladas */}
        {!isLoading && filtered.length > 0 && (
          <Stack sx={{ display: { xs: 'flex', md: 'none' } }} divider={<Divider />}>
            {filtered.map((inv) => (
              <Box key={inv.id} sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} fontFamily="monospace" noWrap>
                      {inv.number ?? `${inv.id.slice(0, 8)}…`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {appName(inv.applicationId)} · {fmtDate(inv.createdAt)}
                    </Typography>
                  </Box>
                  <Box textAlign="right" flexShrink={0}>
                    <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {fmtMoney(inv.displayAmount)} {inv.displayCurrency}
                    </Typography>
                    {inv.chargedAmount && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {fmtMoney(inv.chargedAmount)} {inv.chargedCurrency}
                      </Typography>
                    )}
                  </Box>
                </Stack>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<FactCheckIcon />}
                  onClick={() => setSelected(toDialogInvoice(inv))}
                  sx={{ mt: 1.5, minHeight: 40 }}
                >
                  Verificar / Otorgar
                </Button>
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      <ManualPaymentDialog invoice={selected} onClose={() => setSelected(null)} />
    </Box>
  );
};

export default ManualVerificationPage;

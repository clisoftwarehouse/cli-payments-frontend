import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LinkIcon from '@mui/icons-material/Link';
import ReceiptIcon from '@mui/icons-material/Receipt';
import {
  Box,
  Card,
  Link,
  Table,
  Stack,
  Alert,
  Button,
  Skeleton,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  CardContent,
  IconButton,
  Tooltip,
  TableContainer,
  Typography,
} from '@mui/material';

import { StatusChip } from '@/shared/ui/status-chip';
import { thSx, filterBarSx } from '@/shared/ui/table-styles';
import { invoicesApi, type InvoiceDto } from '../../api/invoices-api';
import { PageHeader } from '@/shared/ui/page-header';
import { CreateInvoiceDialog } from '../components/create-invoice-dialog';
import { CheckoutLinkDialog } from '../components/checkout-link-dialog';

const InvoicesPage = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [linkInvoice, setLinkInvoice] = useState<InvoiceDto | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.list(),
  });

  const issueMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.issue(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setLinkInvoice(data);
    },
  });

  const handleCreated = async (invoiceId: string) => {
    setCreateOpen(false);
    issueMutation.mutate(invoiceId);
  };

  return (
    <Box>
      <PageHeader
        title="Facturas"
        subtitle="Crea, emite y envía el link de pago al cliente. Numeración correlativa CLI-YYYY-NNNNNN."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Nueva factura
          </Button>
        }
      />

      <Card variant="outlined">
        {/* Filter bar / info row */}
        <Box sx={filterBarSx}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Todas las facturas
          </Typography>
          {data && (
            <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
              {data.length} resultado{data.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {isError && <Alert severity="error" sx={{ m: 2.5 }}>Error cargando facturas.</Alert>}
        {issueMutation.isError && (
          <Alert severity="error" sx={{ mx: 2.5, mb: 0 }}>
            {(issueMutation.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al emitir factura'}
          </Alert>
        )}

        {isLoading && (
          <Box sx={{ px: 2.5, py: 2 }}>
            <Stack spacing={1.5}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={42} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          </Box>
        )}

        {!isLoading && data?.length === 0 && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 8 }}>
            <ReceiptIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Box textAlign="center">
              <Typography variant="subtitle2" fontWeight={600}>Sin facturas todavía</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Crea la primera factura para comenzar a cobrar.
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} size="small">
              Nueva factura
            </Button>
          </Stack>
        )}

        {!isLoading && data && data.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                  <TableCell sx={thSx}>Número</TableCell>
                  <TableCell sx={thSx}>Estado</TableCell>
                  <TableCell align="right" sx={thSx}>Total</TableCell>
                  <TableCell align="right" sx={thSx}>Equiv. VES</TableCell>
                  <TableCell sx={thSx}>Emitida</TableCell>
                  <TableCell align="right" sx={{ ...thSx, width: 100 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((inv) => (
                  <TableRow key={inv.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Link component={RouterLink} to={`/invoices/${inv.id}`} underline="hover" fontWeight={600}>
                        {inv.number ?? <em style={{ color: 'inherit', opacity: 0.6 }}>borrador</em>}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusChip variant="invoice" status={inv.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {Number(inv.displayAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })} {inv.displayCurrency}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {inv.chargedAmount
                          ? `${Number(inv.chargedAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })} ${inv.chargedCurrency}`
                          : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(inv.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {inv.status === 'draft' && (
                          <Tooltip title="Emitir factura">
                            <IconButton size="small" onClick={() => issueMutation.mutate(inv.id)} disabled={issueMutation.isPending} sx={{ color: 'text.secondary' }}>
                              <SendIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {inv.checkoutToken && (
                          <Tooltip title="Link de pago">
                            <IconButton size="small" onClick={() => setLinkInvoice(inv)} sx={{ color: 'text.secondary' }}>
                              <LinkIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Descargar PDF">
                          <IconButton size="small" component="a" href={invoicesApi.pdfUrl(inv.id)} target="_blank" rel="noreferrer" sx={{ color: 'text.secondary' }}>
                            <PictureAsPdfIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <CreateInvoiceDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
      {linkInvoice && <CheckoutLinkDialog open onClose={() => setLinkInvoice(null)} invoice={linkInvoice} />}
    </Box>
  );
};

export default InvoicesPage;

import { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import SendIcon from '@mui/icons-material/Send';
import LinkIcon from '@mui/icons-material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  Box,
  Card,
  Grid,
  Link,
  Stack,
  Alert,
  Table,
  Button,
  Divider,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  CardContent,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { StatusChip } from '@/shared/ui/status-chip';
import { PageHeader } from '@/shared/ui/page-header';
import { paymentsApi } from '@/features/payments/api/payments-api';
import { customersApi } from '@/features/customers/api/customers-api';
import { applicationsApi } from '@/features/applications/api/applications-api';

import { invoicesApi } from '../../api/invoices-api';
import { CheckoutLinkDialog } from '../components/checkout-link-dialog';

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Typography variant="overline" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2">{value ?? '—'}</Typography>
  </Box>
);

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [linkOpen, setLinkOpen] = useState(false);

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesApi.findById(id!),
    enabled: !!id,
  });

  const { data: customer } = useQuery({
    queryKey: ['customers', invoice?.customerId],
    queryFn: () => customersApi.findById(invoice!.customerId),
    enabled: !!invoice?.customerId,
  });

  const { data: apps } = useQuery({ queryKey: ['applications'], queryFn: () => applicationsApi.list() });

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.list(),
  });

  const issue = useMutation({
    mutationFn: () => invoicesApi.issue(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ p: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (isError || !invoice) {
    return <Alert severity="error">No se pudo cargar la factura.</Alert>;
  }

  const app = apps?.find((a) => a.id === invoice.applicationId);
  const invoicePayments = payments?.filter((p) => p.invoiceId === invoice.id) ?? [];

  return (
    <Box>
      <PageHeader
        title={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <span>{invoice.number ?? 'Factura (borrador)'}</span>
            <StatusChip variant="invoice" status={invoice.status} />
          </Stack>
        }
        subtitle={
          <span>
            ID <code>{invoice.id}</code>
          </span>
        }
        actions={
          <>
            {invoice.status === 'draft' && (
              <Button
                startIcon={<SendIcon />}
                variant="contained"
                color="primary"
                onClick={() => issue.mutate()}
                disabled={issue.isPending}
              >
                {issue.isPending ? 'Emitiendo…' : 'Emitir'}
              </Button>
            )}
            {invoice.checkoutToken && (
              <Button startIcon={<LinkIcon />} variant="outlined" onClick={() => setLinkOpen(true)}>
                Link de pago
              </Button>
            )}
            <Button
              startIcon={<PictureAsPdfIcon />}
              variant="outlined"
              component="a"
              href={invoicesApi.pdfUrl(invoice.id)}
              target="_blank"
              rel="noreferrer"
            >
              PDF
            </Button>
            <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/invoices">
              Volver
            </Button>
          </>
        }
      />

      {issue.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(issue.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Error al emitir factura'}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Items</Typography>
                <Divider />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Descripción</TableCell>
                        <TableCell align="right">Cant.</TableCell>
                        <TableCell align="right">Precio unit. (EUR)</TableCell>
                        <TableCell align="right">Total (EUR)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoice.items.map((it) => (
                        <TableRow key={it.id}>
                          <TableCell>{it.description}</TableCell>
                          <TableCell align="right">{it.quantity}</TableCell>
                          <TableCell align="right">
                            {Number(it.unitAmountEur).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="right">
                            {Number(it.lineTotalEur).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <strong>Total</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>
                            {Number(invoice.displayAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}{' '}
                            {invoice.displayCurrency}
                          </strong>
                        </TableCell>
                      </TableRow>
                      {invoice.chargedAmount && (
                        <TableRow>
                          <TableCell colSpan={3} align="right" sx={{ color: 'text.secondary' }}>
                            Equivalente cobro
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'text.secondary' }}>
                            {Number(invoice.chargedAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}{' '}
                            {invoice.chargedCurrency}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {invoice.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        Notas
                      </Typography>
                      <Typography variant="body2">{invoice.notes}</Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mt: 2.5 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Pagos ({invoicePayments.length})
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {invoicePayments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  Sin pagos registrados todavía.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Método</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell>Ref. gateway</TableCell>
                        <TableCell>Fecha</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoicePayments.map((p) => (
                        <TableRow key={p.id} hover>
                          <TableCell>
                            <code style={{ fontSize: '0.85em' }}>{p.id.slice(0, 8)}…</code>
                          </TableCell>
                          <TableCell>
                            <StatusChip variant="payment" status={p.status} />
                          </TableCell>
                          <TableCell>{p.methodKind}</TableCell>
                          <TableCell align="right">
                            {Number(p.displayAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}{' '}
                            {p.displayCurrency}
                          </TableCell>
                          <TableCell>{p.gatewayReference ?? '—'}</TableCell>
                          <TableCell>{new Date(p.createdAt).toLocaleString('es-VE')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Datos</Typography>
                <Divider />
                <Field
                  label="Aplicación"
                  value={app ? `${app.name} (${app.slug})` : invoice.applicationId}
                />
                <Field
                  label="Cliente"
                  value={
                    customer ? (
                      <Link component={RouterLink} to={`/customers/${customer.id}`}>
                        {customer.fullName} — {customer.email}
                      </Link>
                    ) : (
                      invoice.customerId
                    )
                  }
                />
                <Field label="Creada" value={new Date(invoice.createdAt).toLocaleString('es-VE')} />
                <Field
                  label="Vencimiento"
                  value={invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-VE') : '—'}
                />
                <Field
                  label="Pagada"
                  value={invoice.paidAt ? new Date(invoice.paidAt).toLocaleString('es-VE') : '—'}
                />

                <Divider />
                <Typography variant="overline" color="text.secondary">
                  FX snapshot
                </Typography>
                <Field
                  label="Tasa usada"
                  value={
                    invoice.fxRateUsed
                      ? `${Number(invoice.fxRateUsed).toLocaleString('es-VE')} (${invoice.fxRateSource ?? '—'})`
                      : '—'
                  }
                />
                <Field
                  label="Fecha tasa"
                  value={invoice.fxRateDate ? new Date(invoice.fxRateDate).toLocaleDateString('es-VE') : '—'}
                />

                {invoice.checkoutToken && (
                  <>
                    <Divider />
                    <Typography variant="overline" color="text.secondary">
                      Checkout
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Token expira:{' '}
                      {invoice.checkoutTokenExpiresAt
                        ? new Date(invoice.checkoutTokenExpiresAt).toLocaleString('es-VE')
                        : '—'}
                    </Typography>
                    <Button size="small" variant="outlined" onClick={() => setLinkOpen(true)}>
                      Ver / copiar link
                    </Button>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {linkOpen && invoice.checkoutToken && (
        <CheckoutLinkDialog open onClose={() => setLinkOpen(false)} invoice={invoice} />
      )}
    </Box>
  );
};

export default InvoiceDetailPage;

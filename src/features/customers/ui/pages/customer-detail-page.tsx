import { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Card,
  Chip,
  Grid,
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

import { PageHeader } from '@/shared/ui/page-header';
import { invoicesApi } from '@/features/invoices/api/invoices-api';
import { subscriptionsApi } from '@/features/subscriptions/api/subscriptions-api';

import { customersApi } from '../../api/customers-api';
import { UpsertCustomerDialog } from '../components/upsert-customer-dialog';

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Typography variant="overline" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2">{value ?? '—'}</Typography>
  </Box>
);

const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [editOpen, setEditOpen] = useState(false);

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersApi.findById(id!),
    enabled: !!id,
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices', { customerId: id }],
    queryFn: () => invoicesApi.list({ customerId: id }),
    enabled: !!id,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions', { customerId: id }],
    queryFn: () => subscriptionsApi.list({ customerId: id }),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ p: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (isError || !customer) {
    return <Alert severity="error">No se pudo cargar el cliente.</Alert>;
  }

  const myInvoices = invoices ?? [];

  return (
    <Box>
      <PageHeader
        title={customer.fullName}
        subtitle={
          <span>
            <code>{customer.email}</code> · {customer.country}
          </span>
        }
        actions={
          <>
            <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
            <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/customers">
              Volver
            </Button>
          </>
        }
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Datos</Typography>
                <Divider />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Field label="Email" value={customer.email} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Field label="País" value={customer.country} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Field label="Teléfono" value={customer.phone ?? '—'} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Field
                      label="Documento"
                      value={
                        customer.identityType && customer.identityValue
                          ? `${customer.identityType.toUpperCase()}: ${customer.identityValue}`
                          : '—'
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Field label="Razón social" value={customer.legalName ?? '—'} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Field label="Dirección" value={customer.address ?? '—'} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Field label="Locale" value={customer.defaultLocale} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Field label="Creado" value={new Date(customer.createdAt).toLocaleString('es-VE')} />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2.5}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Facturas ({myInvoices.length})
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {myInvoices.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Sin facturas todavía.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Número</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell>Fecha</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myInvoices.map((inv) => (
                          <TableRow key={inv.id} hover component={RouterLink} to={`/invoices/${inv.id}`} sx={{ textDecoration: 'none' }}>
                            <TableCell>{inv.number ?? <em>borrador</em>}</TableCell>
                            <TableCell>
                              <Chip label={inv.status} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              {Number(inv.displayAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}{' '}
                              {inv.displayCurrency}
                            </TableCell>
                            <TableCell>{new Date(inv.createdAt).toLocaleDateString('es-VE')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Suscripciones ({subscriptions?.length ?? 0})
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {!subscriptions ? (
                  <CircularProgress size={20} />
                ) : subscriptions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Sin suscripciones todavía.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Ciclo</TableCell>
                          <TableCell>Vence</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {subscriptions.map((s) => (
                          <TableRow key={s.id} hover component={RouterLink} to={`/subscriptions/${s.id}`} sx={{ textDecoration: 'none' }}>
                            <TableCell>
                              <code style={{ fontSize: '0.85em' }}>{s.id.slice(0, 8)}…</code>
                            </TableCell>
                            <TableCell>
                              <Chip label={s.status} size="small" />
                            </TableCell>
                            <TableCell>{s.billingCycle}</TableCell>
                            <TableCell>{new Date(s.currentPeriodEnd).toLocaleDateString('es-VE')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {editOpen && (
        <UpsertCustomerDialog open onClose={() => setEditOpen(false)} customer={customer} />
      )}
    </Box>
  );
};

export default CustomerDetailPage;

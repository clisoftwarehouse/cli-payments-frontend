import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
  Button,
  Select,
  Skeleton,
  MenuItem,
  Tooltip,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  InputLabel,
  FormControl,
  IconButton,
  Typography,
  TableContainer,
} from '@mui/material';

import { PageHeader } from '@/shared/ui/page-header';
import { thSx, filterBarSx } from '@/shared/ui/table-styles';
import { applicationsApi } from '@/features/applications/api/applications-api';
import {
  paymentReceivingAccountsApi,
  type PaymentReceivingAccountDto,
  type CreatePaymentReceivingAccountDto,
} from '../../api/payment-receiving-accounts-api';
import { AccountFormDialog } from '../components/account-form-dialog';

const METHOD_LABEL: Record<string, string> = {
  transfer: 'Transferencia',
  pago_movil: 'Pago Móvil P2P',
};

const PaymentReceivingAccountsPage = () => {
  const queryClient = useQueryClient();
  const [applicationId, setApplicationId] = useState('');
  const [method, setMethod] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentReceivingAccountDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: apps } = useQuery({ queryKey: ['applications'], queryFn: () => applicationsApi.list() });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payment-receiving-accounts', { applicationId, method }],
    queryFn: () => paymentReceivingAccountsApi.list({ applicationId: applicationId || undefined, method: method || undefined }),
  });

  const saveMutation = useMutation({
    mutationFn: (dto: CreatePaymentReceivingAccountDto) =>
      editing
        ? paymentReceivingAccountsApi.update(editing.id, dto)
        : paymentReceivingAccountsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-receiving-accounts'] });
      setDialogOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentReceivingAccountsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-receiving-accounts'] });
      setDeleteError(null);
    },
    onError: (err: Error) => setDeleteError(err.message),
  });

  const toggleActive = (acc: PaymentReceivingAccountDto) => {
    paymentReceivingAccountsApi.update(acc.id, { isActive: !acc.isActive }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['payment-receiving-accounts'] });
    });
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (acc: PaymentReceivingAccountDto) => {
    setEditing(acc);
    setDialogOpen(true);
  };

  return (
    <Box>
      <PageHeader
        title="Cuentas receptoras"
        subtitle="Cuentas bancarias y teléfonos de pago móvil que el cliente ve al elegir Transferencia o Pago Móvil P2P."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nueva cuenta
          </Button>
        }
      />

      <Card variant="outlined">
        <Box sx={filterBarSx}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Aplicación</InputLabel>
            <Select label="Aplicación" value={applicationId} onChange={(e) => setApplicationId(e.target.value)}>
              <MenuItem value="">Todas</MenuItem>
              {apps?.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Método</InputLabel>
            <Select label="Método" value={method} onChange={(e) => setMethod(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="transfer">Transferencia</MenuItem>
              <MenuItem value="pago_movil">Pago Móvil P2P</MenuItem>
            </Select>
          </FormControl>
          {data && (
            <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
              {data.length} cuenta{data.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {isError && <Alert severity="error" sx={{ m: 2.5 }}>Error cargando cuentas.</Alert>}
        {deleteError && <Alert severity="error" sx={{ mx: 2.5, mb: 0 }} onClose={() => setDeleteError(null)}>{deleteError}</Alert>}
        {saveMutation.isError && (
          <Alert severity="error" sx={{ mx: 2.5, mb: 0 }}>
            {(saveMutation.error as Error)?.message ?? 'Error al guardar la cuenta.'}
          </Alert>
        )}

        {isLoading && (
          <Box sx={{ px: 2.5, py: 2 }}>
            <Stack spacing={1.5}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={42} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          </Box>
        )}

        {!isLoading && data?.length === 0 && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 8 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Box textAlign="center">
              <Typography variant="subtitle2" fontWeight={600}>Sin cuentas configuradas</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Agrega las cuentas bancarias o teléfonos de pago móvil para que los clientes vean a dónde transferir.
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} size="small">
              Nueva cuenta
            </Button>
          </Stack>
        )}

        {!isLoading && data && data.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                  <TableCell sx={thSx}>Aplicación</TableCell>
                  <TableCell sx={thSx}>Método</TableCell>
                  <TableCell sx={thSx}>Banco</TableCell>
                  <TableCell sx={thSx}>Titular / Doc.</TableCell>
                  <TableCell sx={thSx}>Cuenta / Teléfono</TableCell>
                  <TableCell sx={thSx}>Estado</TableCell>
                  <TableCell sx={{ ...thSx, width: 88 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((acc) => {
                  const app = apps?.find((a) => a.id === acc.applicationId);
                  return (
                    <TableRow key={acc.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {app?.name ?? acc.applicationId.slice(0, 8) + '…'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={METHOD_LABEL[acc.methodKind] ?? acc.methodKind}
                          size="small"
                          variant="outlined"
                          color={acc.methodKind === 'transfer' ? 'warning' : 'info'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{acc.bankName}</Typography>
                        <Typography variant="caption" color="text.disabled">{acc.bankCode}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{acc.accountHolder}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {acc.identityDocument}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {acc.methodKind === 'transfer' && (
                          <Stack>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{acc.accountNumber ?? '—'}</Typography>
                            <Typography variant="caption" color="text.disabled">{acc.accountType ?? ''}</Typography>
                          </Stack>
                        )}
                        {acc.methodKind === 'pago_movil' && (
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{acc.phone ?? '—'}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={acc.isActive ? 'Activa' : 'Inactiva'}
                          size="small"
                          color={acc.isActive ? 'success' : 'default'}
                          onClick={() => toggleActive(acc)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => openEdit(acc)} sx={{ color: 'text.secondary' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => deleteMutation.mutate(acc.id)}
                              disabled={deleteMutation.isPending}
                              sx={{ color: 'text.secondary' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <AccountFormDialog
        open={dialogOpen}
        defaultApplicationId={applicationId}
        editing={editing}
        isPending={saveMutation.isPending}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={(dto) => saveMutation.mutate(dto)}
      />
    </Box>
  );
};

export default PaymentReceivingAccountsPage;

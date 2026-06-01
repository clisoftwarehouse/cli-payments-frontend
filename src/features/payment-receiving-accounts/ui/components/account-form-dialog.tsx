import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import {
  Box,
  Stack,
  Button,
  Dialog,
  Select,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  DialogTitle,
  FormHelperText,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { banksApi } from '@/features/banks/api/banks-api';
import { applicationsApi } from '@/features/applications/api/applications-api';
import type {
  PaymentReceivingAccountDto,
  CreatePaymentReceivingAccountDto,
} from '../../api/payment-receiving-accounts-api';

const schema = z
  .object({
    applicationId: z.string().min(1, 'Selecciona una aplicación'),
    methodKind: z.enum(['transfer', 'pago_movil']),
    bankId: z.string().min(1, 'Selecciona un banco'),
    accountHolder: z.string().min(1, 'Requerido').max(100),
    identityDocument: z.string().min(1, 'Requerido').max(20),
    accountNumber: z.string().max(20).optional(),
    accountType: z.enum(['corriente', 'ahorro']).optional(),
    phone: z.string().max(20).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.methodKind === 'transfer') {
      if (!v.accountNumber) ctx.addIssue({ code: 'custom', path: ['accountNumber'], message: 'Requerido para transferencia' });
      if (!v.accountType) ctx.addIssue({ code: 'custom', path: ['accountType'], message: 'Requerido para transferencia' });
    }
    if (v.methodKind === 'pago_movil') {
      if (!v.phone) ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Requerido para pago móvil' });
    }
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  /** Pre-selecciona la aplicación si hay un filtro activo en la página. */
  defaultApplicationId?: string;
  editing: PaymentReceivingAccountDto | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (dto: CreatePaymentReceivingAccountDto) => void;
};

export const AccountFormDialog = ({ open, defaultApplicationId, editing, isPending, onClose, onSubmit }: Props) => {
  const { data: banks = [] } = useQuery({ queryKey: ['banks'], queryFn: banksApi.list });
  const { data: apps = [] } = useQuery({ queryKey: ['applications'], queryFn: applicationsApi.list });

  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { applicationId: '', methodKind: 'transfer', bankId: '' },
  });

  const methodKind = watch('methodKind');

  useEffect(() => {
    if (open) {
      if (editing) {
        const matchedBank = banks.find((b) => parseInt(b.ibpCode, 10) === editing.bankCode);
        reset({
          applicationId: editing.applicationId,
          methodKind: editing.methodKind,
          bankId: matchedBank?.id ?? '',
          accountHolder: editing.accountHolder,
          identityDocument: editing.identityDocument,
          accountNumber: editing.accountNumber ?? '',
          accountType: (editing.accountType as 'corriente' | 'ahorro') ?? undefined,
          phone: editing.phone ?? '',
        });
      } else {
        reset({ applicationId: defaultApplicationId ?? '', methodKind: 'transfer', bankId: '' });
      }
    }
  }, [open, editing, banks, defaultApplicationId, reset]);

  const handleFormSubmit = (values: FormValues) => {
    const bank = banks.find((b) => b.id === values.bankId);
    onSubmit({
      applicationId: values.applicationId,
      methodKind: values.methodKind,
      bankCode: bank ? parseInt(bank.ibpCode, 10) : 0,
      bankName: bank?.name ?? '',
      accountHolder: values.accountHolder,
      identityDocument: values.identityDocument,
      accountNumber: values.accountNumber,
      accountType: values.accountType,
      phone: values.phone,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar cuenta' : 'Nueva cuenta receptora'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>

            {/* Aplicación */}
            <Controller
              name="applicationId"
              control={control}
              render={({ field }) => (
                <FormControl size="small" error={!!errors.applicationId} fullWidth>
                  <InputLabel>Aplicación</InputLabel>
                  <Select {...field} label="Aplicación">
                    {apps.map((a) => (
                      <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                    ))}
                  </Select>
                  {errors.applicationId && <FormHelperText>{errors.applicationId.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Divider />

            {/* Método */}
            <Controller
              name="methodKind"
              control={control}
              render={({ field }) => (
                <FormControl size="small" error={!!errors.methodKind} fullWidth>
                  <InputLabel>Método</InputLabel>
                  <Select {...field} label="Método">
                    <MenuItem value="transfer">Transferencia bancaria</MenuItem>
                    <MenuItem value="pago_movil">Pago Móvil P2P</MenuItem>
                  </Select>
                  {errors.methodKind && <FormHelperText>{errors.methodKind.message}</FormHelperText>}
                </FormControl>
              )}
            />

            {/* Banco */}
            <Controller
              name="bankId"
              control={control}
              render={({ field }) => (
                <FormControl size="small" error={!!errors.bankId} fullWidth>
                  <InputLabel>Banco</InputLabel>
                  <Select {...field} label="Banco">
                    {banks.filter((b) => b.isActive).map((b) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.ibpCode} — {b.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.bankId && <FormHelperText>{errors.bankId.message}</FormHelperText>}
                </FormControl>
              )}
            />

            {/* Titular + Documento */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                {...register('accountHolder')}
                label="Nombre del titular"
                size="small"
                error={!!errors.accountHolder}
                helperText={errors.accountHolder?.message}
              />
              <TextField
                {...register('identityDocument')}
                label="Cédula / RIF"
                size="small"
                placeholder="V-12345678"
                error={!!errors.identityDocument}
                helperText={errors.identityDocument?.message}
              />
            </Box>

            {/* Transferencia: número + tipo */}
            {methodKind === 'transfer' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  {...register('accountNumber')}
                  label="Número de cuenta (20 dígitos)"
                  size="small"
                  inputProps={{ maxLength: 20 }}
                  error={!!errors.accountNumber}
                  helperText={errors.accountNumber?.message}
                />
                <Controller
                  name="accountType"
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" error={!!errors.accountType} fullWidth>
                      <InputLabel>Tipo de cuenta</InputLabel>
                      <Select {...field} label="Tipo de cuenta" value={field.value ?? ''}>
                        <MenuItem value="corriente">Corriente</MenuItem>
                        <MenuItem value="ahorro">Ahorro</MenuItem>
                      </Select>
                      {errors.accountType && <FormHelperText>{errors.accountType.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Box>
            )}

            {/* Pago móvil: teléfono */}
            {methodKind === 'pago_movil' && (
              <TextField
                {...register('phone')}
                label="Teléfono"
                size="small"
                placeholder="584120000000"
                error={!!errors.phone}
                helperText={errors.phone?.message ?? 'Sin guiones ni espacios'}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} /> : null}
          >
            {editing ? 'Guardar cambios' : 'Crear cuenta'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

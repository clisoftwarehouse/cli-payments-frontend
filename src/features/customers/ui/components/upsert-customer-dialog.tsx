import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Stack,
  Alert,
  Button,
  Dialog,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { z } from 'zod';

import { customersApi, type CustomerDto, type UpsertCustomerInput } from '../../api/customers-api';

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  country: z.string().length(2).optional(),
  identityType: z.enum(['rif', 'cedula', 'passport', 'nif', 'other']).optional(),
  identityValue: z.string().optional(),
  legalName: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  customer?: CustomerDto;
};

export const UpsertCustomerDialog = ({ open, onClose, customer }: Props) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: customer
      ? {
          email: customer.email,
          fullName: customer.fullName,
          phone: customer.phone ?? '',
          country: customer.country,
          identityType: customer.identityType ?? 'cedula',
          identityValue: customer.identityValue ?? '',
          legalName: customer.legalName ?? '',
          address: customer.address ?? '',
        }
      : { country: 'VE', identityType: 'cedula' },
  });

  const mutation = useMutation({
    mutationFn: (input: UpsertCustomerInput) => customersApi.upsert(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.id] });
      reset();
      onClose();
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>{customer ? `Actualizar ${customer.fullName}` : 'Crear / actualizar cliente'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {mutation.isError && (
              <Alert severity="error">
                {(mutation.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ??
                  'Error'}
              </Alert>
            )}
            <TextField
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message ?? 'Identifica al cliente junto con el país'}
              fullWidth
            />
            <TextField
              label="Nombre completo"
              {...register('fullName')}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField label="País (ISO-2)" defaultValue="VE" {...register('country')} sx={{ width: 120 }} />
              <TextField label="Teléfono" {...register('phone')} fullWidth />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl sx={{ width: 160 }}>
                <InputLabel>Tipo de ID</InputLabel>
                <Select defaultValue="cedula" label="Tipo de ID" {...register('identityType')}>
                  <MenuItem value="cedula">Cédula</MenuItem>
                  <MenuItem value="rif">RIF</MenuItem>
                  <MenuItem value="passport">Pasaporte</MenuItem>
                  <MenuItem value="nif">NIF</MenuItem>
                  <MenuItem value="other">Otro</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Valor del documento" {...register('identityValue')} fullWidth />
            </Stack>
            <TextField label="Razón social (opcional)" {...register('legalName')} fullWidth />
            <TextField label="Dirección (opcional)" multiline rows={2} {...register('address')} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

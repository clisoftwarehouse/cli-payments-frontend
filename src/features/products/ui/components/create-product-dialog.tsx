import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

import { applicationsApi } from '@/features/applications/api/applications-api';
import { productsApi, type ProductDto, type CreateProductInput, type ProductKind } from '../../api/products-api';

const KIND_OPTIONS: Array<{ value: ProductKind; label: string }> = [
  { value: 'subscription_plan', label: 'Suscripción SaaS' },
  { value: 'dev_project', label: 'Proyecto a medida' },
  { value: 'audit', label: 'Auditoría' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'addon', label: 'Addon' },
  { value: 'one_shot', label: 'One-shot' },
];

const schema = z
  .object({
    sku: z.string().min(2).max(80),
    name: z.string().min(2).max(160),
    description: z.string().optional(),
    kind: z.enum(['subscription_plan', 'dev_project', 'audit', 'maintenance', 'addon', 'one_shot']),
    priceCurrency: z.enum(['EUR', 'USD']),
    priceAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Formato: 123.45'),
    billingInterval: z.enum(['monthly', 'annual']).optional(),
    applicationId: z.string().uuid().optional().or(z.literal('')),
  })
  .refine(
    (v) => v.kind !== 'subscription_plan' || !!v.billingInterval,
    { path: ['billingInterval'], message: 'Requerido para suscripciones' },
  );

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  product?: ProductDto;
};

export const CreateProductDialog = ({ open, onClose, product }: Props) => {
  const queryClient = useQueryClient();
  const { data: apps } = useQuery({ queryKey: ['applications'], queryFn: () => applicationsApi.list() });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          sku: product.sku,
          name: product.name,
          description: product.description ?? '',
          kind: product.kind,
          priceCurrency: product.priceCurrency,
          priceAmount: product.priceAmount,
          billingInterval: product.billingInterval ?? undefined,
          applicationId: product.applicationId ?? '',
        }
      : { kind: 'dev_project', priceCurrency: 'EUR' },
  });

  const kind = watch('kind');

  const mutation = useMutation({
    mutationFn: (input: CreateProductInput) =>
      product ? productsApi.update(product.id, input) : productsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reset();
      onClose();
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate({
      sku: values.sku,
      name: values.name,
      description: values.description,
      kind: values.kind,
      priceCurrency: values.priceCurrency,
      priceAmount: values.priceAmount,
      billingInterval: values.billingInterval,
      applicationId: values.applicationId || undefined,
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>{product ? `Editar ${product.name}` : 'Nuevo producto'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {mutation.isError && (
              <Alert severity="error">
                {(mutation.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ??
                  'Error'}
              </Alert>
            )}
            <Stack direction="row" spacing={2}>
              <TextField
                label="SKU"
                placeholder="vitriona-entrepreneur-monthly"
                {...register('sku')}
                error={!!errors.sku}
                helperText={errors.sku?.message}
                fullWidth
              />
              <FormControl sx={{ width: 220 }}>
                <InputLabel>Tipo</InputLabel>
                <Select defaultValue="dev_project" label="Tipo" {...register('kind')}>
                  {KIND_OPTIONS.map((k) => (
                    <MenuItem key={k.value} value={k.value}>
                      {k.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              label="Nombre"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
            <TextField label="Descripción" multiline rows={2} {...register('description')} fullWidth />
            <Stack direction="row" spacing={2}>
              <FormControl sx={{ width: 110 }}>
                <InputLabel>Moneda</InputLabel>
                <Select defaultValue="EUR" label="Moneda" {...register('priceCurrency')}>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Precio"
                placeholder="15.00"
                {...register('priceAmount')}
                error={!!errors.priceAmount}
                helperText={errors.priceAmount?.message}
                fullWidth
              />
              {kind === 'subscription_plan' && (
                <FormControl sx={{ width: 160 }}>
                  <InputLabel>Ciclo</InputLabel>
                  <Select defaultValue="monthly" label="Ciclo" {...register('billingInterval')}>
                    <MenuItem value="monthly">Mensual</MenuItem>
                    <MenuItem value="annual">Anual</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Stack>
            {errors.billingInterval && (
              <Alert severity="warning" variant="outlined">
                {errors.billingInterval.message as string}
              </Alert>
            )}
            <FormControl fullWidth>
              <InputLabel>Aplicación (opcional)</InputLabel>
              <Select defaultValue="" label="Aplicación (opcional)" {...register('applicationId')}>
                <MenuItem value="">Ninguna (global)</MenuItem>
                {apps?.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name} ({a.slug})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando…' : product ? 'Guardar cambios' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

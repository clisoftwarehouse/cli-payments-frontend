import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Stack,
  Alert,
  Button,
  Dialog,
  Select,
  MenuItem,
  Divider,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { z } from 'zod';

import { invoicesApi, type CreateInvoiceInput } from '../../api/invoices-api';
import { customersApi } from '@/features/customers/api/customers-api';
import { productsApi } from '@/features/products/api/products-api';
import { applicationsApi } from '@/features/applications/api/applications-api';

const itemSchema = z.object({
  productId: z.string().uuid().optional().or(z.literal('')),
  description: z.string().min(2),
  quantity: z.coerce.number().int().positive(),
  unitAmountEur: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Formato: 123.45'),
});

const schema = z.object({
  applicationId: z.string().uuid(),
  customerId: z.string().uuid(),
  displayCurrency: z.enum(['EUR', 'USD']),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Agrega al menos un item'),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (invoiceId: string) => void;
};

export const CreateInvoiceDialog = ({ open, onClose, onCreated }: Props) => {
  const queryClient = useQueryClient();
  const { data: apps } = useQuery({ queryKey: ['applications'], queryFn: () => applicationsApi.list() });
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: () => customersApi.list() });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => productsApi.list() });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayCurrency: 'EUR',
      items: [{ description: '', quantity: 1, unitAmountEur: '0.00', productId: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const mutation = useMutation({
    mutationFn: (input: CreateInvoiceInput) => invoicesApi.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      reset();
      onCreated(data.id);
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate({
      applicationId: values.applicationId,
      customerId: values.customerId,
      displayCurrency: values.displayCurrency,
      dueDate: values.dueDate || undefined,
      notes: values.notes || undefined,
      items: values.items.map((it) => ({
        productId: it.productId || undefined,
        description: it.description,
        quantity: it.quantity,
        unitAmountEur: it.unitAmountEur,
      })),
    });
  });

  const handleProductPick = (idx: number, productId: string) => {
    const p = products?.find((x) => x.id === productId);
    if (!p) return;
    setValue(`items.${idx}.productId`, productId);
    setValue(`items.${idx}.description`, p.name);
    setValue(`items.${idx}.unitAmountEur`, p.priceAmount);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>Nueva factura (draft)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {mutation.isError && (
              <Alert severity="error">
                {(mutation.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ??
                  'Error al crear factura'}
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth error={!!errors.applicationId}>
                <InputLabel>Aplicación</InputLabel>
                <Select defaultValue="" label="Aplicación" {...register('applicationId')}>
                  {apps?.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name} ({a.slug})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth error={!!errors.customerId}>
                <InputLabel>Cliente</InputLabel>
                <Select defaultValue="" label="Cliente" {...register('customerId')}>
                  {customers?.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.fullName} — {c.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ width: 110 }}>
                <InputLabel>Moneda</InputLabel>
                <Select defaultValue="EUR" label="Moneda" {...register('displayCurrency')}>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Divider />

            <Typography variant="subtitle2">Items</Typography>

            {fields.map((field, idx) => (
              <Stack key={field.id} direction="row" spacing={1} alignItems="flex-start">
                <Controller
                  control={control}
                  name={`items.${idx}.productId`}
                  render={({ field: f }) => (
                    <FormControl sx={{ minWidth: 200 }} size="small">
                      <InputLabel>Producto (opcional)</InputLabel>
                      <Select
                        label="Producto (opcional)"
                        value={f.value ?? ''}
                        onChange={(e) => handleProductPick(idx, e.target.value as string)}
                      >
                        <MenuItem value="">Ad-hoc</MenuItem>
                        {products?.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name} ({p.priceCurrency} {p.priceAmount})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
                <TextField
                  label="Descripción"
                  size="small"
                  {...register(`items.${idx}.description`)}
                  error={!!errors.items?.[idx]?.description}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Cant."
                  type="number"
                  size="small"
                  {...register(`items.${idx}.quantity`)}
                  error={!!errors.items?.[idx]?.quantity}
                  sx={{ width: 80 }}
                />
                <TextField
                  label="Precio unit."
                  size="small"
                  {...register(`items.${idx}.unitAmountEur`)}
                  error={!!errors.items?.[idx]?.unitAmountEur}
                  sx={{ width: 120 }}
                />
                <IconButton onClick={() => remove(idx)} disabled={fields.length === 1}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}

            <Box>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() =>
                  append({ description: '', quantity: 1, unitAmountEur: '0.00', productId: '' })
                }
              >
                Agregar item
              </Button>
            </Box>

            <Divider />

            <Stack direction="row" spacing={2}>
              <TextField label="Due date (YYYY-MM-DD)" {...register('dueDate')} sx={{ width: 220 }} />
              <TextField label="Notas" {...register('notes')} fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creando…' : 'Crear draft'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

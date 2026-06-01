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

import { applicationsApi, type CreateApplicationInput } from '../../api/applications-api';

const schema = z.object({
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9](-?[a-z0-9])+$/, 'Lowercase, sin acentos, separado por guiones'),
  name: z.string().min(2).max(120),
  mode: z.enum(['live', 'test']).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
};

export const CreateApplicationDialog = ({ open, onClose }: Props) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mode: 'live' },
  });

  const mutation = useMutation({
    mutationFn: (input: CreateApplicationInput) => applicationsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      reset();
      onClose();
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate({
      slug: values.slug,
      name: values.name,
      mode: values.mode,
      websiteUrl: values.websiteUrl || undefined,
      contactEmail: values.contactEmail || undefined,
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>Nueva aplicación</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {mutation.isError && (
              <Alert severity="error">
                {(mutation.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ??
                  'Error al crear aplicación'}
              </Alert>
            )}
            <TextField
              label="Slug"
              placeholder="vitriona"
              {...register('slug')}
              error={!!errors.slug}
              helperText={errors.slug?.message ?? 'Identificador único, kebab-case'}
              fullWidth
            />
            <TextField
              label="Nombre"
              placeholder="Vitriona"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Modo</InputLabel>
              <Select defaultValue="live" label="Modo" {...register('mode')}>
                <MenuItem value="live">live</MenuItem>
                <MenuItem value="test">test</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Website (opcional)"
              placeholder="https://vitriona.app"
              {...register('websiteUrl')}
              error={!!errors.websiteUrl}
              helperText={errors.websiteUrl?.message}
              fullWidth
            />
            <TextField
              label="Contact email (opcional)"
              type="email"
              {...register('contactEmail')}
              error={!!errors.contactEmail}
              helperText={errors.contactEmail?.message}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creando…' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

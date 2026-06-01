import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

import { banksApi } from '@/features/banks/api/banks-api';
import {
  merchantTerminalsApi,
  type CreateMerchantTerminalInput,
} from '../../api/merchant-terminals-api';

const schema = z.object({
  label: z.string().min(2).max(120),
  sitefUsername: z.string().min(2).max(120),
  sitefPassword: z.string().min(1, 'Requerido'),
  sitefIdBranch: z.coerce.number().int().nonnegative(),
  sitefCodeStall: z.string().min(1).max(16),
  acquirerBank: z.coerce.number().int(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  applicationId: string;
};

export const CreateTerminalDialog = ({ open, onClose, applicationId }: Props) => {
  const queryClient = useQueryClient();
  const { data: banks } = useQuery({ queryKey: ['banks'], queryFn: () => banksApi.list() });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (input: CreateMerchantTerminalInput) => merchantTerminalsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-terminals', applicationId] });
      reset();
      onClose();
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate({ ...values, applicationId });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>Nuevo terminal Sitef</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {mutation.isError && (
              <Alert severity="error">
                {(mutation.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ??
                  'Error al crear terminal'}
              </Alert>
            )}
            <Alert severity="info" variant="outlined">
              Las credenciales se cifran AES-256-GCM antes de persistir. La contraseña no vuelve a mostrarse.
            </Alert>

            <TextField
              label="Etiqueta"
              placeholder="Vitriona — sucursal principal"
              {...register('label')}
              error={!!errors.label}
              helperText={errors.label?.message}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Sitef username"
                {...register('sitefUsername')}
                error={!!errors.sitefUsername}
                helperText={errors.sitefUsername?.message}
                fullWidth
              />
              <TextField
                label="Sitef password"
                type="password"
                {...register('sitefPassword')}
                error={!!errors.sitefPassword}
                helperText={errors.sitefPassword?.message}
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="ID Branch"
                type="number"
                {...register('sitefIdBranch')}
                error={!!errors.sitefIdBranch}
                helperText={errors.sitefIdBranch?.message}
                sx={{ width: 140 }}
              />
              <TextField
                label="Code Stall"
                {...register('sitefCodeStall')}
                error={!!errors.sitefCodeStall}
                helperText={errors.sitefCodeStall?.message}
                sx={{ width: 160 }}
              />
              <FormControl fullWidth error={!!errors.acquirerBank}>
                <InputLabel>Banco adquirente</InputLabel>
                <Select label="Banco adquirente" defaultValue="" {...register('acquirerBank')}>
                  {banks?.map((b) => (
                    <MenuItem key={b.id} value={b.ibpCode}>
                      {b.ibpCode} — {b.shortName ?? b.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Notas (opcional)"
              multiline
              rows={2}
              {...register('notes')}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creando…' : 'Crear terminal'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

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

import { usersApi, ROLE_ID, STATUS_ID, type UserDto } from '../../api/users-api';

const buildSchema = (isEdit: boolean) =>
  z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: isEdit
      ? z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal(''))
      : z.string().min(8, 'Mínimo 8 caracteres'),
    roleId: z.coerce.number().int(),
    statusId: z.coerce.number().int(),
  });

type Props = {
  open: boolean;
  onClose: () => void;
  user?: UserDto;
};

export const UpsertUserDialog = ({ open, onClose, user }: Props) => {
  const queryClient = useQueryClient();
  const isEdit = !!user;
  const schema = buildSchema(isEdit);
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: user
      ? {
          email: user.email ?? '',
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          password: '',
          roleId: user.role?.id ?? ROLE_ID.user,
          statusId: user.status?.id ?? STATUS_ID.active,
        }
      : {
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          roleId: ROLE_ID.user,
          statusId: STATUS_ID.active,
        },
  });

  const mutation = useMutation({
    mutationFn: (values: Values) => {
      const payload = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        role: { id: Number(values.roleId) },
        status: { id: Number(values.statusId) },
        ...(values.password ? { password: values.password } : {}),
      };
      return isEdit ? usersApi.update(user!.id, payload) : usersApi.create(payload as never);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      reset();
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <DialogTitle>{isEdit ? `Editar ${user!.email ?? user!.id}` : 'Nuevo usuario admin'}</DialogTitle>
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
                label="Nombre"
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                fullWidth
              />
              <TextField
                label="Apellido"
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                fullWidth
              />
            </Stack>

            <TextField
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />

            <TextField
              label={isEdit ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select label="Rol" defaultValue={user?.role?.id ?? ROLE_ID.user} {...register('roleId')}>
                  <MenuItem value={ROLE_ID.admin}>Admin</MenuItem>
                  <MenuItem value={ROLE_ID.user}>Usuario</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select label="Estado" defaultValue={user?.status?.id ?? STATUS_ID.active} {...register('statusId')}>
                  <MenuItem value={STATUS_ID.active}>Activo</MenuItem>
                  <MenuItem value={STATUS_ID.inactive}>Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

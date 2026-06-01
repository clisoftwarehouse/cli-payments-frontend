import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Box, Alert, Stack, Button, TextField, Typography } from '@mui/material';

import { useLogin } from '../../model/use-login';
import { loginSchema, type LoginFormValues } from '../schemas/login-schema';

export const LoginForm = () => {
  const navigate = useNavigate();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      navigate('/');
    } catch {
      // El alert ya muestra el error desde login.error
    }
  });

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Panel administrativo de CLI Payments
          </Typography>
        </Box>

        {login.isError && (
          <Alert severity="error">
            {(login.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ??
              'Credenciales inválidas o servicio no disponible'}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          fullWidth
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          fullWidth
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting || login.isPending}>
          {login.isPending ? 'Ingresando...' : 'Entrar'}
        </Button>
      </Stack>
    </Box>
  );
};

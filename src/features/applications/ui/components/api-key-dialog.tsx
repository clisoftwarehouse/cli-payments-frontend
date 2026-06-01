import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import KeyIcon from '@mui/icons-material/Key';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Dialog,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { z } from 'zod';

import { applicationsApi, type ApiKeyWithSecretDto } from '../../api/applications-api';

const AVAILABLE_SCOPES = [
  'payments:create',
  'payments:read',
  'invoices:create',
  'invoices:read',
  'customers:write',
  'customers:read',
  'subscriptions:write',
  'subscriptions:read',
  'fx:read',
] as const;

const schema = z.object({
  label: z.string().min(2).max(120),
  scopes: z.array(z.string()).min(1, 'Selecciona al menos un scope'),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  applicationName: string;
};

export const ApiKeyDialog = ({ open, onClose, applicationId, applicationName }: Props) => {
  const queryClient = useQueryClient();
  const [created, setCreated] = useState<ApiKeyWithSecretDto | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: 'Production', scopes: ['payments:create', 'invoices:create'] },
  });

  const selectedScopes = watch('scopes') ?? [];

  const mutation = useMutation({
    mutationFn: (input: FormValues) => applicationsApi.createApiKey(applicationId, input),
    onSuccess: (data) => {
      setCreated(data);
      queryClient.invalidateQueries({ queryKey: ['applications', applicationId, 'api-keys'] });
    },
  });

  const toggleScope = (scope: string) => {
    const next = selectedScopes.includes(scope)
      ? selectedScopes.filter((s) => s !== scope)
      : [...selectedScopes, scope];
    setValue('scopes', next, { shouldValidate: true });
  };

  const close = () => {
    setCreated(null);
    reset();
    onClose();
  };

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onClose={created ? undefined : close} maxWidth="sm" fullWidth>
      <DialogTitle>
        {created ? 'API key creada' : `Generar API key — ${applicationName}`}
      </DialogTitle>
      {created ? (
        <>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              El <strong>secret</strong> solo se muestra una vez. Cópialo ahora — no podrás verlo de nuevo.
            </Alert>

            <Stack spacing={2}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Public ID
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField value={created.publicId} fullWidth size="small" InputProps={{ readOnly: true }} />
                  <Tooltip title="Copiar">
                    <IconButton onClick={() => copy(created.publicId)}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">
                  Secret
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField value={created.secret} fullWidth size="small" InputProps={{ readOnly: true }} />
                  <Tooltip title="Copiar">
                    <IconButton onClick={() => copy(created.secret)}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">
                  Scopes
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {created.scopes.map((s) => (
                    <Chip key={s} label={s} size="small" sx={{ mb: 0.5 }} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={close} variant="contained">
              Entendido
            </Button>
          </DialogActions>
        </>
      ) : (
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <DialogContent>
            <Stack spacing={2}>
              {mutation.isError && (
                <Alert severity="error">
                  {(mutation.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ??
                    'Error al generar API key'}
                </Alert>
              )}

              <TextField
                label="Etiqueta"
                placeholder="Production / Staging / etc."
                {...register('label')}
                error={!!errors.label}
                helperText={errors.label?.message}
                fullWidth
              />

              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Scopes
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {AVAILABLE_SCOPES.map((scope) => (
                    <Chip
                      key={scope}
                      icon={<KeyIcon />}
                      label={scope}
                      onClick={() => toggleScope(scope)}
                      color={selectedScopes.includes(scope) ? 'primary' : 'default'}
                      variant={selectedScopes.includes(scope) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
                {errors.scopes && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    {errors.scopes.message as string}
                  </Typography>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={close}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={mutation.isPending}>
              {mutation.isPending ? 'Generando…' : 'Generar'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

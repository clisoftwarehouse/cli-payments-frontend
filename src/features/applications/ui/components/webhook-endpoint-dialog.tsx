import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import EventIcon from '@mui/icons-material/Event';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Dialog,
  Divider,
  Tooltip,
  Typography,
  TextField,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { z } from 'zod';

import {
  applicationsApi,
  WEBHOOK_EVENTS,
  type WebhookEventType,
  type WebhookEndpointWithSecretDto,
} from '../../api/applications-api';

const schema = z.object({
  url: z.string().url('URL inválida — debe incluir https://'),
  activeEvents: z.array(z.string()).min(1, 'Selecciona al menos un evento'),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  applicationName: string;
};

export const WebhookEndpointDialog = ({ open, onClose, applicationId, applicationName }: Props) => {
  const queryClient = useQueryClient();
  const [created, setCreated] = useState<WebhookEndpointWithSecretDto | null>(null);

  const { data: existing } = useQuery({
    queryKey: ['applications', applicationId, 'webhook-endpoints'],
    queryFn: () => applicationsApi.listWebhookEndpoints(applicationId),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: '',
      activeEvents: ['payment.succeeded', 'invoice.paid', 'subscription.renewed'],
    },
  });

  const selected = (watch('activeEvents') ?? []) as WebhookEventType[];

  const mutation = useMutation({
    mutationFn: (input: FormValues) =>
      applicationsApi.createWebhookEndpoint(applicationId, {
        url: input.url,
        activeEvents: input.activeEvents as WebhookEventType[],
      }),
    onSuccess: (data) => {
      setCreated(data);
      queryClient.invalidateQueries({ queryKey: ['applications', applicationId, 'webhook-endpoints'] });
    },
  });

  const toggle = (ev: WebhookEventType) => {
    const next = selected.includes(ev) ? selected.filter((e) => e !== ev) : [...selected, ev];
    setValue('activeEvents', next, { shouldValidate: true });
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
      <DialogTitle>{created ? 'Webhook endpoint creado' : `Nuevo webhook endpoint — ${applicationName}`}</DialogTitle>

      {created ? (
        <>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              El <strong>signing secret</strong> solo se muestra una vez. Cópialo y guárdalo en{' '}
              <code>CLI_PAYMENTS_WEBHOOK_SECRET</code> del SaaS receptor.
            </Alert>

            <Stack spacing={2}>
              <Box>
                <Typography variant="overline" color="text.secondary">URL</Typography>
                <Typography variant="body2"><code>{created.url}</code></Typography>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">Signing secret</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField value={created.signingSecret} fullWidth size="small" InputProps={{ readOnly: true }} />
                  <Tooltip title="Copiar">
                    <IconButton onClick={() => copy(created.signingSecret)}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">Eventos suscritos</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {created.activeEvents.map((e) => (
                    <Chip key={e} label={e} size="small" sx={{ mb: 0.5 }} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={close} variant="contained">Entendido</Button>
          </DialogActions>
        </>
      ) : (
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <DialogContent>
            <Stack spacing={2}>
              {existing && existing.length > 0 && (
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Endpoints existentes
                  </Typography>
                  <Stack spacing={0.75}>
                    {existing.map((ep) => (
                      <Box
                        key={ep.id}
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderRadius: 1,
                          bgcolor: 'background.default',
                          border: (t) => `1px solid ${t.palette.divider}`,
                        }}
                      >
                        <Typography variant="body2"><code>{ep.url}</code></Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                          {ep.activeEvents.map((e) => (
                            <Chip key={e} label={e} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}

              {mutation.isError && (
                <Alert severity="error">
                  {(mutation.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ??
                    'Error al crear webhook endpoint'}
                </Alert>
              )}

              <TextField
                label="URL"
                placeholder="https://vitriona.app/api/webhooks/cli-payments"
                {...register('url')}
                error={!!errors.url}
                helperText={errors.url?.message ?? 'El receptor debe verificar X-CLIP-Signature con el signing secret.'}
                fullWidth
              />

              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Eventos a recibir
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {WEBHOOK_EVENTS.map((ev) => (
                    <Chip
                      key={ev}
                      icon={<EventIcon />}
                      label={ev}
                      onClick={() => toggle(ev)}
                      color={selected.includes(ev) ? 'primary' : 'default'}
                      variant={selected.includes(ev) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
                {errors.activeEvents && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    {errors.activeEvents.message as string}
                  </Typography>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={close}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creando…' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

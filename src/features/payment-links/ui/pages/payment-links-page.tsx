import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { z as zod } from 'zod';

import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  Card,
  Grid,
  Alert,
  Stack,
  Button,
  Select,
  Divider,
  MenuItem,
  Tooltip,
  TextField,
  InputLabel,
  FormControl,
  Typography,
  FormHelperText,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { PageHeader } from '@/shared/ui/page-header';
import { applicationsApi } from '@/features/applications/api/applications-api';
import { invoicesApi, type PaymentLinkResult } from '@/features/invoices/api/invoices-api';

const schema = zod.object({
  applicationId: z.string().min(1, 'Selecciona una aplicación'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido (ej: 150.00)').refine((v) => parseFloat(v) > 0, 'El monto debe ser mayor a 0'),
  description: z.string().min(3, 'Describe el concepto cobrado').max(500),
  notes: z.string().max(1000).optional(),
  customerEmail: z.string().email('Email inválido'),
  customerFullName: z.string().min(2, 'Nombre requerido').max(240),
  customerPhone: z.string().max(40).optional(),
  customerIdentityValue: z.string().max(60).optional(),
  customerIdentityType: z.enum(['rif', 'cedula', 'passport', 'nif', 'other']).optional(),
});

type FormValues = z.infer<typeof schema>;

const PaymentLinksPage = () => {
  const [result, setResult] = useState<PaymentLinkResult | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: apps = [] } = useQuery({ queryKey: ['applications'], queryFn: applicationsApi.list });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { applicationId: '', customerIdentityType: 'rif' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      invoicesApi.generatePaymentLink({
        applicationId: values.applicationId,
        amount: values.amount,
        description: values.description,
        notes: values.notes || undefined,
        customer: {
          email: values.customerEmail,
          fullName: values.customerFullName,
          phone: values.customerPhone || undefined,
          identityType: values.customerIdentityType,
          identityValue: values.customerIdentityValue || undefined,
        },
      }),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNew = () => {
    setResult(null);
    reset({ applicationId: '', customerIdentityType: 'rif' });
  };

  return (
    <Box>
      <PageHeader
        title="Links de pago"
        subtitle="Genera un link de pago con monto fijo para enviarlo a un cliente vía WhatsApp, email o cualquier canal."
      />

      <Grid container spacing={3}>
        {/* ── Formulario ─────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ p: 3 }}>
            {result ? (
              /* ── Resultado ── */
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <CheckIcon sx={{ color: 'success.main', fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>Link generado</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Factura #{result.invoice.number} · €{result.invoice.displayAmount}
                    </Typography>
                  </Box>
                </Stack>

                <TextField
                  value={result.checkoutUrl}
                  label="URL de pago"
                  size="small"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: 13 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={copied ? 'Copiado' : 'Copiar'}>
                          <IconButton size="small" onClick={handleCopy}>
                            {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Abrir">
                          <IconButton size="small" component="a" href={result.checkoutUrl} target="_blank" rel="noopener noreferrer">
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />

                <Alert severity="info" sx={{ fontSize: 13 }}>
                  El link expira en 7 días. Si el cliente no paga antes, genera uno nuevo.
                </Alert>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleNew}
                  fullWidth
                >
                  Generar otro link
                </Button>
              </Stack>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit((v) => mutation.mutate(v))}>
                <Stack spacing={2.5}>
                  <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={0.5} fontSize={11}>
                    Concepto
                  </Typography>

                  <Controller
                    name="applicationId"
                    control={control}
                    render={({ field }) => (
                      <FormControl size="small" error={!!errors.applicationId} fullWidth>
                        <InputLabel>Aplicación / Proyecto</InputLabel>
                        <Select {...field} label="Aplicación / Proyecto">
                          {apps.map((a) => (
                            <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                          ))}
                        </Select>
                        {errors.applicationId && <FormHelperText>{errors.applicationId.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />

                  <TextField
                    {...register('description')}
                    label="Descripción del servicio"
                    size="small"
                    fullWidth
                    placeholder="Ej: Desarrollo de módulo de reportes — Sprint 3"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />

                  <TextField
                    {...register('amount')}
                    label="Monto (EUR)"
                    size="small"
                    sx={{ maxWidth: 200 }}
                    placeholder="150.00"
                    error={!!errors.amount}
                    helperText={errors.amount?.message ?? 'Referencial. Se cobra en VES a tasa BCV del día.'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>,
                    }}
                  />

                  <TextField
                    {...register('notes')}
                    label="Notas adicionales (opcional)"
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                  />

                  <Divider />

                  <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={0.5} fontSize={11}>
                    Cliente
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      {...register('customerFullName')}
                      label="Nombre / Razón social *"
                      size="small"
                      error={!!errors.customerFullName}
                      helperText={errors.customerFullName?.message}
                    />
                    <TextField
                      {...register('customerEmail')}
                      label="Email *"
                      size="small"
                      type="email"
                      error={!!errors.customerEmail}
                      helperText={errors.customerEmail?.message}
                    />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      {...register('customerPhone')}
                      label="Teléfono"
                      size="small"
                      placeholder="+58 412 0000000"
                      error={!!errors.customerPhone}
                      helperText={errors.customerPhone?.message}
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 1 }}>
                      <Controller
                        name="customerIdentityType"
                        control={control}
                        render={({ field }) => (
                          <FormControl size="small">
                            <InputLabel>Tipo</InputLabel>
                            <Select {...field} label="Tipo" value={field.value ?? 'rif'}>
                              <MenuItem value="rif">RIF</MenuItem>
                              <MenuItem value="cedula">Cédula</MenuItem>
                              <MenuItem value="other">Otro</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                      <TextField
                        {...register('customerIdentityValue')}
                        label="Número"
                        size="small"
                        placeholder="J-12345678-9"
                        error={!!errors.customerIdentityValue}
                        helperText={errors.customerIdentityValue?.message}
                      />
                    </Box>
                  </Box>

                  {mutation.isError && (
                    <Alert severity="error">
                      {(mutation.error as Error)?.message ?? 'Error al generar el link.'}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={mutation.isPending ? <CircularProgress size={18} color="inherit" /> : <LinkIcon />}
                    disabled={mutation.isPending}
                    fullWidth
                  >
                    {mutation.isPending ? 'Generando…' : 'Generar link de pago'}
                  </Button>
                </Stack>
              </form>
            )}
          </Card>
        </Grid>

        {/* ── Guía lateral ───────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <Card variant="outlined" sx={{ p: 2.5, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>¿Cómo funciona?</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {[
                  'Completa el concepto y los datos del cliente.',
                  'Copia el link generado y envíalo por WhatsApp, email o cualquier canal.',
                  'El cliente abre el link y paga con C2P, transferencia o tarjeta.',
                  'Cuando el pago se confirma, aparece en Pagos y Facturas automáticamente.',
                ].map((step, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        minWidth: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        mt: 0.2,
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Typography variant="body2" color="text.secondary">{step}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Notas</Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">• El monto es referencial en EUR. Se cobra en VES a la tasa BCV del día del pago.</Typography>
                <Typography variant="body2" color="text.secondary">• El link expira en 7 días. Si no se paga, genera uno nuevo.</Typography>
                <Typography variant="body2" color="text.secondary">• El cliente no necesita crear una cuenta para pagar.</Typography>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentLinksPage;

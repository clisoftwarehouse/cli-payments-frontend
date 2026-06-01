import { useParams, Link as RouterLink } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Alert,
  Button,
  Divider,
  Typography,
  CardContent,
  CircularProgress,
} from '@mui/material';

import { PageHeader } from '@/shared/ui/page-header';
import { TerminalsSection } from '@/features/merchant-terminals/ui/components/terminals-section';

import { applicationsApi } from '../../api/applications-api';
import { ApiKeysSection } from '../components/api-keys-section';
import { WebhooksSection } from '../components/webhooks-section';

const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: app, isLoading, isError } = useQuery({
    queryKey: ['applications', id],
    queryFn: () => applicationsApi.findById(id!),
    enabled: !!id,
  });

  const toggle = useMutation({
    mutationFn: (isActive: boolean) => applicationsApi.update(id!, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
    },
  });

  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ p: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (isError || !app) {
    return <Alert severity="error">No se pudo cargar la aplicación.</Alert>;
  }

  return (
    <Box>
      <PageHeader
        title={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <span>{app.name}</span>
            <Chip
              label={app.mode}
              size="small"
              color={app.mode === 'live' ? 'success' : 'warning'}
              variant="outlined"
            />
            <Chip
              label={app.isActive ? 'active' : 'inactive'}
              size="small"
              color={app.isActive ? 'success' : 'default'}
            />
          </Stack>
        }
        subtitle={
          <span>
            slug <code>{app.slug}</code>
            {app.websiteUrl ? (
              <>
                {' · '}
                <a href={app.websiteUrl} target="_blank" rel="noreferrer">
                  {app.websiteUrl}
                </a>
              </>
            ) : null}
            {app.contactEmail ? <> · {app.contactEmail}</> : null}
          </span>
        }
        actions={
          <>
            <Button
              startIcon={<PowerSettingsNewIcon />}
              color={app.isActive ? 'warning' : 'success'}
              onClick={() => toggle.mutate(!app.isActive)}
              disabled={toggle.isPending}
            >
              {app.isActive ? 'Desactivar' : 'Activar'}
            </Button>
            <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/applications">
              Volver
            </Button>
          </>
        }
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Resumen
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" spacing={4} flexWrap="wrap">
                <Box>
                  <Typography variant="overline" color="text.secondary" display="block">
                    ID
                  </Typography>
                  <Typography>
                    <code>{app.id}</code>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary" display="block">
                    Creada
                  </Typography>
                  <Typography>{new Date(app.createdAt).toLocaleString('es-VE')}</Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary" display="block">
                    Última actualización
                  </Typography>
                  <Typography>{new Date(app.updatedAt).toLocaleString('es-VE')}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ApiKeysSection applicationId={app.id} applicationName={app.name} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <WebhooksSection applicationId={app.id} applicationName={app.name} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TerminalsSection applicationId={app.id} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Atajos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to={`/invoices?applicationId=${app.id}`}
                >
                  Facturas de esta app
                </Button>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to={`/payments?applicationId=${app.id}`}
                >
                  Pagos de esta app
                </Button>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to={`/subscriptions?applicationId=${app.id}`}
                >
                  Suscripciones de esta app
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplicationDetailPage;

import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import KeyIcon from '@mui/icons-material/Key';
import WebhookIcon from '@mui/icons-material/Webhook';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  Card,
  Chip,
  Link,
  Table,
  Stack,
  Alert,
  Button,
  Tooltip,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  CardContent,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { applicationsApi, type ApplicationDto } from '../../api/applications-api';
import { ApiKeyDialog } from '../components/api-key-dialog';
import { PageHeader } from '@/shared/ui/page-header';
import { WebhookEndpointDialog } from '../components/webhook-endpoint-dialog';
import { CreateApplicationDialog } from '../components/create-application-dialog';

const ApplicationsPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [keyTarget, setKeyTarget] = useState<ApplicationDto | null>(null);
  const [hookTarget, setHookTarget] = useState<ApplicationDto | null>(null);

  const { data: apps, isLoading, isError } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list(),
  });

  return (
    <Box>
      <PageHeader
        title="Aplicaciones"
        subtitle="SaaS y landings que consumen la API de CLI Payments. Cada una tiene sus propias API keys y webhooks."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Nueva aplicación
          </Button>
        }
      />

      <Card variant="outlined">
        <CardContent>
          {isError && <Alert severity="error">Error cargando aplicaciones.</Alert>}
          {isLoading && (
            <Stack alignItems="center" sx={{ p: 4 }}>
              <CircularProgress />
            </Stack>
          )}
          {!isLoading && apps?.length === 0 && (
            <Stack alignItems="center" spacing={1} sx={{ p: 4 }}>
              <Box sx={{ color: 'text.secondary' }}>Aún no hay aplicaciones registradas.</Box>
              <Button onClick={() => setCreateOpen(true)} variant="outlined">
                Registrar primera aplicación
              </Button>
            </Stack>
          )}
          {!isLoading && apps && apps.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Slug</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Modo</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Sitio web</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apps.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell>
                        <Link component={RouterLink} to={`/applications/${app.id}`} underline="hover">
                          <code>{app.slug}</code>
                        </Link>
                      </TableCell>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={app.mode}
                          size="small"
                          color={app.mode === 'live' ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={app.isActive ? 'Activa' : 'Inactiva'}
                          size="small"
                          color={app.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {app.websiteUrl ? (
                          <a href={app.websiteUrl} target="_blank" rel="noreferrer">
                            {app.websiteUrl}
                          </a>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Nueva API key">
                            <IconButton size="small" onClick={() => setKeyTarget(app)}>
                              <KeyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Webhooks">
                            <IconButton size="small" onClick={() => setHookTarget(app)}>
                              <WebhookIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Abrir detalle">
                            <IconButton size="small" component={RouterLink} to={`/applications/${app.id}`}>
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <CreateApplicationDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {keyTarget && (
        <ApiKeyDialog
          open
          onClose={() => setKeyTarget(null)}
          applicationId={keyTarget.id}
          applicationName={keyTarget.name}
        />
      )}
      {hookTarget && (
        <WebhookEndpointDialog
          open
          onClose={() => setHookTarget(null)}
          applicationId={hookTarget.id}
          applicationName={hookTarget.name}
        />
      )}
    </Box>
  );
};

export default ApplicationsPage;

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
  Button,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  CardContent,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { applicationsApi } from '../../api/applications-api';
import { WebhookEndpointDialog } from './webhook-endpoint-dialog';

type Props = {
  applicationId: string;
  applicationName: string;
};

export const WebhooksSection = ({ applicationId, applicationName }: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['applications', applicationId, 'webhook-endpoints'],
    queryFn: () => applicationsApi.listWebhookEndpoints(applicationId),
  });

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">Webhooks salientes</Typography>
            <Typography variant="caption" color="text.secondary">
              URLs que reciben eventos (HMAC firmado con signing secret). Las entregas se ven en Outbox.
            </Typography>
          </Box>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setDialogOpen(true)}>
            Nuevo endpoint
          </Button>
        </Stack>

        {isLoading && <CircularProgress size={20} />}
        {!isLoading && data?.length === 0 && (
          <Alert severity="info" variant="outlined">
            Sin webhooks registrados todavía. Los eventos se persisten en outbox pero nadie los recibirá externamente.
          </Alert>
        )}
        {!isLoading && data && data.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>URL</TableCell>
                  <TableCell>Eventos</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Creado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((h) => (
                  <TableRow key={h.id} hover>
                    <TableCell sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <code style={{ fontSize: '0.85em' }}>{h.url}</code>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {h.activeEvents.map((e) => (
                          <Chip key={e} label={e} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={h.isActive ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={h.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{new Date(h.createdAt).toLocaleDateString('es-VE')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      {dialogOpen && (
        <WebhookEndpointDialog
          open
          onClose={() => setDialogOpen(false)}
          applicationId={applicationId}
          applicationName={applicationName}
        />
      )}
    </Card>
  );
};

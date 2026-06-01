import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import KeyIcon from '@mui/icons-material/Key';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
  Button,
  Tooltip,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  IconButton,
  CardContent,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { applicationsApi } from '../../api/applications-api';
import { ApiKeyDialog } from './api-key-dialog';

type Props = {
  applicationId: string;
  applicationName: string;
};

export const ApiKeysSection = ({ applicationId, applicationName }: Props) => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['applications', applicationId, 'api-keys'],
    queryFn: () => applicationsApi.listApiKeys(applicationId),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => applicationsApi.revokeApiKey(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['applications', applicationId, 'api-keys'] }),
  });

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">API keys</Typography>
            <Typography variant="caption" color="text.secondary">
              Header <code>X-CLIP-API-Key: publicId:secret</code>. El secret solo se ve una vez al crear.
            </Typography>
          </Box>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setDialogOpen(true)}>
            Nueva key
          </Button>
        </Stack>

        {isLoading && <CircularProgress size={20} />}
        {!isLoading && data?.length === 0 && (
          <Alert severity="warning" variant="outlined">
            Esta aplicación no tiene keys activas. Genera una para que pueda llamar a la API.
          </Alert>
        )}
        {!isLoading && data && data.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Etiqueta</TableCell>
                  <TableCell>ID público</TableCell>
                  <TableCell>Scopes</TableCell>
                  <TableCell>Último uso</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((k) => (
                  <TableRow key={k.id} hover sx={{ opacity: k.revokedAt ? 0.5 : 1 }}>
                    <TableCell>{k.label}</TableCell>
                    <TableCell>
                      <code style={{ fontSize: '0.85em' }}>{k.publicId}</code>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {k.scopes.map((s) => (
                          <Chip key={s} label={s} size="small" icon={<KeyIcon />} variant="outlined" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString('es-VE') : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={k.revokedAt ? 'Revocada' : 'Activa'}
                        size="small"
                        color={k.revokedAt ? 'default' : 'success'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {!k.revokedAt && (
                        <Tooltip title="Revocar">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                if (confirm('¿Revocar esta API key? Cualquier sistema que la use dejará de poder llamar a la API.'))
                                  revoke.mutate(k.id);
                              }}
                              disabled={revoke.isPending}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      {dialogOpen && (
        <ApiKeyDialog
          open
          onClose={() => setDialogOpen(false)}
          applicationId={applicationId}
          applicationName={applicationName}
        />
      )}
    </Card>
  );
};

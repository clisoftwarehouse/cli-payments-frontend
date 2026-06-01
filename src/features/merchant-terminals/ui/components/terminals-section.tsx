import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
  Switch,
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

import { merchantTerminalsApi } from '../../api/merchant-terminals-api';
import { CreateTerminalDialog } from './create-terminal-dialog';

type Props = {
  applicationId: string;
};

export const TerminalsSection = ({ applicationId }: Props) => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['merchant-terminals', applicationId],
    queryFn: () => merchantTerminalsApi.list(applicationId),
  });

  const toggle = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      merchantTerminalsApi.setActive(id, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['merchant-terminals', applicationId] }),
  });

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">Terminales Sitef</Typography>
            <Typography variant="caption" color="text.secondary">
              Credenciales que CLI Payments usa para llamar a Sitef en nombre de esta aplicación.
            </Typography>
          </Box>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setDialogOpen(true)}>
            Nuevo terminal
          </Button>
        </Stack>

        {isError && <Alert severity="error">Error cargando terminales.</Alert>}
        {isLoading && <CircularProgress size={20} />}
        {!isLoading && data?.length === 0 && (
          <Alert severity="warning" variant="outlined">
            Esta aplicación todavía no tiene terminales — los pagos vía Sitef fallarán hasta que registres uno.
          </Alert>
        )}
        {!isLoading && data && data.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Etiqueta</TableCell>
                  <TableCell>Usuario Sitef</TableCell>
                  <TableCell>Sucursal / Caja</TableCell>
                  <TableCell>Adquirente</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.label}</TableCell>
                    <TableCell>
                      <code>{t.sitefUsername}</code>
                    </TableCell>
                    <TableCell>
                      {t.sitefIdBranch} / {t.sitefCodeStall}
                    </TableCell>
                    <TableCell>{String(t.acquirerBank).padStart(4, '0')}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Switch
                          size="small"
                          checked={t.isActive}
                          disabled={toggle.isPending}
                          onChange={(_, v) => toggle.mutate({ id: t.id, value: v })}
                        />
                        <Chip
                          label={t.isActive ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={t.isActive ? 'success' : 'default'}
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      <CreateTerminalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        applicationId={applicationId}
      />
    </Card>
  );
};

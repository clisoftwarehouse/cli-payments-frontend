import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import ReplayIcon from '@mui/icons-material/Replay';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Card,
  Table,
  Stack,
  Alert,
  Select,
  Tooltip,
  MenuItem,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  InputLabel,
  IconButton,
  FormControl,
  CardContent,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { StatusChip } from '@/shared/ui/status-chip';
import { PageHeader } from '@/shared/ui/page-header';
import {
  outboxApi,
  type OutboxDeliveryDto,
  type OutboxTargetType,
  type OutboxDeliveryStatus,
} from '../../api/outbox-api';
import { OutboxDeliveryDialog } from '../components/outbox-delivery-dialog';

const TARGET_LABEL: Record<OutboxTargetType, string> = {
  webhook_endpoint: 'Webhook',
  internal_handler: 'Handler interno',
};

const OutboxPage = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>('');
  const [targetType, setTargetType] = useState<string>('');
  const [detail, setDetail] = useState<OutboxDeliveryDto | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['outbox', 'deliveries', { status, targetType }],
    queryFn: () =>
      outboxApi.listDeliveries({
        status: (status || undefined) as OutboxDeliveryStatus | undefined,
        target_type: (targetType || undefined) as OutboxTargetType | undefined,
      }),
    refetchInterval: 10_000,
  });

  const replay = useMutation({
    mutationFn: (id: string) => outboxApi.replay(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outbox', 'deliveries'] }),
  });

  return (
    <Box>
      <PageHeader
        title="Outbox"
        subtitle="Entregas de eventos a webhooks + handlers internos. Reintenta los que quedaron en giving_up tras revisar la causa."
      />

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ width: 180 }}>
              <InputLabel>Estado</InputLabel>
              <Select label="Estado" value={status} onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pending">Pendiente</MenuItem>
                <MenuItem value="delivering">Entregando</MenuItem>
                <MenuItem value="delivered">Entregado</MenuItem>
                <MenuItem value="giving_up">Abandonado</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ width: 220 }}>
              <InputLabel>Destino</InputLabel>
              <Select label="Destino" value={targetType} onChange={(e) => setTargetType(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="webhook_endpoint">Webhook externo</MenuItem>
                <MenuItem value="internal_handler">Handler interno</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {isError && <Alert severity="error">Error cargando deliveries.</Alert>}
          {replay.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error al reintentar:{' '}
              {(replay.error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ??
                (replay.error as Error)?.message}
            </Alert>
          )}
          {isLoading && (
            <Stack alignItems="center" sx={{ p: 4 }}>
              <CircularProgress />
            </Stack>
          )}
          {!isLoading && data?.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              No hay deliveries para los filtros seleccionados.
            </Box>
          )}
          {!isLoading && data && data.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell>Descriptor</TableCell>
                    <TableCell align="right">Intentos</TableCell>
                    <TableCell>HTTP</TableCell>
                    <TableCell>Último error</TableCell>
                    <TableCell>Creado</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((d) => (
                    <TableRow key={d.id} hover>
                      <TableCell>
                        <code style={{ fontSize: '0.85em' }}>{d.id.slice(0, 8)}…</code>
                      </TableCell>
                      <TableCell>
                        <StatusChip variant="outbox" status={d.status} />
                      </TableCell>
                      <TableCell>{TARGET_LABEL[d.targetType] ?? d.targetType}</TableCell>
                      <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Tooltip title={d.targetDescriptor ?? ''}>
                          <span>{d.targetDescriptor ?? '—'}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">{d.attempts}</TableCell>
                      <TableCell>{d.lastResponseStatus ?? '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Tooltip title={d.lastErrorMessage ?? ''}>
                          <span style={{ color: '#b00' }}>
                            {d.lastErrorCode ? `${d.lastErrorCode}` : d.lastErrorMessage ?? '—'}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{new Date(d.createdAt).toLocaleString('es-VE')}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Ver detalle / payload">
                            <IconButton size="small" onClick={() => setDetail(d)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {(d.status === 'giving_up' || d.status === 'pending') && (
                            <Tooltip title="Reintentar entrega">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => replay.mutate(d.id)}
                                  disabled={replay.isPending}
                                >
                                  <ReplayIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
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

      {detail && <OutboxDeliveryDialog open onClose={() => setDetail(null)} deliveryId={detail.id} />}
    </Box>
  );
};

export default OutboxPage;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  Card,
  Chip,
  Table,
  Alert,
  Stack,
  Button,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  CardContent,
  TableContainer,
} from '@mui/material';

import { fxApi } from '../../api/fx-api';
import { PageHeader } from '@/shared/ui/page-header';

const FxRateCard = ({ currency }: { currency: 'EUR' | 'USD' }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['fx', 'latest', currency],
    queryFn: () => fxApi.latest(currency),
  });

  return (
    <Card variant="outlined" sx={{ flex: 1 }}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            1 {currency} → VES
          </Typography>
          {isLoading && <Typography variant="h4">…</Typography>}
          {isError && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              No hay tasa registrada todavía. Corre el cron o usa "Refrescar ahora".
            </Alert>
          )}
          {data && (
            <>
              <Typography variant="h3" fontWeight={700}>
                {Number(data.rate).toLocaleString('es-VE', { maximumFractionDigits: 2 })}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={data.source} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  {data.effectiveDate}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const FxHistoryTable = ({ currency }: { currency: 'EUR' | 'USD' }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['fx', 'history', currency],
    queryFn: () => fxApi.history(currency),
  });

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Histórico {currency} ({data?.length ?? 0} registros)
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tasa</TableCell>
                <TableCell>Fuente</TableCell>
                <TableCell>Capturada</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Cargando…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && (!data || data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Sin registros aún.
                  </TableCell>
                </TableRow>
              )}
              {data?.map((row) => (
                <TableRow key={row.effectiveDate + row.source}>
                  <TableCell>{row.effectiveDate}</TableCell>
                  <TableCell>{Number(row.rate).toLocaleString('es-VE', { maximumFractionDigits: 4 })}</TableCell>
                  <TableCell>
                    <Chip label={row.source} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{new Date(row.fetchedAt).toLocaleString('es-VE')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const FxPage = () => {
  const queryClient = useQueryClient();
  const refresh = useMutation({
    mutationFn: () => fxApi.refresh(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fx'] });
    },
  });

  return (
    <Box>
      <PageHeader
        title="Tasas FX"
        subtitle="EUR/USD → VES. Fuente primaria: BCV. Fallbacks: Yadio, ExchangeDyn."
        actions={
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending}
          >
            {refresh.isPending ? 'Actualizando…' : 'Refrescar ahora'}
          </Button>
        }
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ mb: 3 }}>
        <FxRateCard currency="EUR" />
        <FxRateCard currency="USD" />
      </Stack>

      <Stack spacing={2.5}>
        <FxHistoryTable currency="EUR" />
        <FxHistoryTable currency="USD" />
      </Stack>
    </Box>
  );
};

export default FxPage;

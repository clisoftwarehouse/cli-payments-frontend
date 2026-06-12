import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import FactCheckIcon from '@mui/icons-material/FactCheck';
import {
  Box,
  Card,
  Table,
  Alert,
  Button,
  Skeleton,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import { PageHeader } from '@/shared/ui/page-header';
import { thSx } from '@/shared/ui/table-styles';
import { invoicesApi } from '@/features/invoices/api/invoices-api';
import { ManualPaymentDialog, type ManualPaymentInvoice } from '../components/manual-payment-dialog';

const ManualVerificationPage = () => {
  const [selected, setSelected] = useState<ManualPaymentInvoice | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoices', { status: 'open' }],
    queryFn: () => invoicesApi.list({ status: 'open' }),
  });

  return (
    <Box>
      <PageHeader
        title="Verificación manual"
        subtitle="Verifica un pago contra Sitef por su referencia, u otórgale la factura manualmente (con motivo) cuando el cobro está confirmado por otra vía."
      />

      <Card variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thSx}>Factura</TableCell>
                <TableCell sx={thSx}>Aplicación</TableCell>
                <TableCell align="right" sx={thSx}>Monto</TableCell>
                <TableCell align="right" sx={thSx}>Equiv. VES</TableCell>
                <TableCell sx={thSx}>Creada</TableCell>
                <TableCell align="right" sx={{ ...thSx, width: 160 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading &&
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton height={28} />
                    </TableCell>
                  </TableRow>
                ))}

              {isError && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Alert severity="error">No se pudieron cargar las facturas.</Alert>
                  </TableCell>
                </TableRow>
              )}

              {data?.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {inv.number ?? inv.id.slice(0, 8)}
                    </Typography>
                  </TableCell>
                  <TableCell>{inv.applicationId.slice(0, 8)}</TableCell>
                  <TableCell align="right">
                    {inv.displayAmount} {inv.displayCurrency}
                  </TableCell>
                  <TableCell align="right">
                    {inv.chargedAmount ? `${inv.chargedAmount} ${inv.chargedCurrency}` : '—'}
                  </TableCell>
                  <TableCell>{new Date(inv.createdAt).toLocaleDateString('es-VE')}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<FactCheckIcon />}
                      onClick={() =>
                        setSelected({
                          id: inv.id,
                          number: inv.number,
                          displayAmount: inv.displayAmount,
                          displayCurrency: inv.displayCurrency,
                          chargedAmount: inv.chargedAmount,
                          chargedCurrency: inv.chargedCurrency,
                        })
                      }
                    >
                      Verificar / Otorgar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {data && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No hay facturas abiertas pendientes de pago.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ManualPaymentDialog invoice={selected} onClose={() => setSelected(null)} />
    </Box>
  );
};

export default ManualVerificationPage;

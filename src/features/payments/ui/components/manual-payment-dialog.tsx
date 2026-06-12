import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Box,
  Tab,
  Tabs,
  Stack,
  Alert,
  Button,
  Dialog,
  Divider,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { paymentsApi, type PaymentDto } from '../../api/payments-api';

export type ManualPaymentInvoice = {
  id: string;
  number: string | null;
  displayAmount: string;
  displayCurrency: string;
  chargedAmount: string | null;
  chargedCurrency: string | null;
};

type Props = {
  invoice: ManualPaymentInvoice | null;
  onClose: () => void;
};

const todayCaracas = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Caracas', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export function ManualPaymentDialog({ invoice, onClose }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState(0);

  // Verify form
  const [method, setMethod] = useState<'transfer' | 'pago_movil'>('transfer');
  const [originBank, setOriginBank] = useState('');
  const [originDni, setOriginDni] = useState('');
  const [debitPhone, setDebitPhone] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [trxDate, setTrxDate] = useState(todayCaracas());

  // Grant form
  const [reason, setReason] = useState('');

  const [result, setResult] = useState<PaymentDto | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['invoices'] });
    qc.invalidateQueries({ queryKey: ['payments'] });
  };

  const verifyMut = useMutation({
    mutationFn: () =>
      paymentsApi.verify({
        invoiceId: invoice!.id,
        method,
        methodData:
          method === 'transfer'
            ? { originBank, originDni, paymentReference, trxDate }
            : { originBank, debitPhone, paymentReference, trxDate },
      }),
    onSuccess: (p) => {
      setResult(p);
      invalidate();
    },
  });

  const grantMut = useMutation({
    mutationFn: () => paymentsApi.grant({ invoiceId: invoice!.id, reason }),
    onSuccess: (p) => {
      setResult(p);
      invalidate();
    },
  });

  const close = () => {
    setResult(null);
    verifyMut.reset();
    grantMut.reset();
    onClose();
  };

  const open = invoice !== null;
  const busy = verifyMut.isPending || grantMut.isPending;

  return (
    <Dialog open={open} onClose={busy ? undefined : close} maxWidth="sm" fullWidth>
      <DialogTitle>
        Verificación manual de pago
        {invoice && (
          <Typography variant="body2" color="text.secondary">
            Factura {invoice.number ?? invoice.id.slice(0, 8)} · {invoice.displayAmount} {invoice.displayCurrency}
            {invoice.chargedAmount ? ` (${invoice.chargedAmount} ${invoice.chargedCurrency})` : ''}
          </Typography>
        )}
      </DialogTitle>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3 }}>
        <Tab label="Verificar con Sitef" />
        <Tab label="Otorgar manualmente" />
      </Tabs>
      <Divider />

      <DialogContent>
        {result && result.status === 'succeeded' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✓ Factura otorgada. {result.methodKind === 'manual' ? 'Marcada como pagada manualmente.' : 'Pago verificado en Sitef.'}{' '}
            Si es una suscripción, se activó.
          </Alert>
        )}
        {result && result.status === 'failed' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Sitef rechazó: <b>{result.failureCode}</b> — {result.failureMessage}
          </Alert>
        )}

        {tab === 0 && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Re-verifica un pago que el cliente ya hizo, por su número de referencia. Si Sitef lo encuentra, se otorga la factura.
            </Typography>
            <TextField select label="Método" value={method} onChange={(e) => setMethod(e.target.value as 'transfer' | 'pago_movil')} size="small">
              <MenuItem value="transfer">Transferencia bancaria</MenuItem>
              <MenuItem value="pago_movil">Pago Móvil P2P</MenuItem>
            </TextField>
            <TextField label="Banco origen (código, ej. 0102)" value={originBank} onChange={(e) => setOriginBank(e.target.value)} size="small" />
            {method === 'transfer' ? (
              <TextField label="Cédula / RIF del emisor (ej. V12345678)" value={originDni} onChange={(e) => setOriginDni(e.target.value)} size="small" />
            ) : (
              <TextField label="Teléfono del pagador (ej. 584120000000)" value={debitPhone} onChange={(e) => setDebitPhone(e.target.value)} size="small" />
            )}
            <TextField label="Número de referencia" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} size="small" />
            <TextField label="Fecha de la transacción" type="date" value={trxDate} onChange={(e) => setTrxDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Esto marca la factura como <b>pagada sin cobrar</b> y otorga la suscripción si aplica. Úsalo solo cuando el pago esté confirmado por otra vía o Sitef no pueda validarlo.
            </Alert>
            <TextField
              label="Motivo (obligatorio)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              minRows={2}
              size="small"
              placeholder="Ej. Transferencia confirmada por captura del cliente; Sitef no la encuentra por límite de prueba."
            />
            {grantMut.isError && <Alert severity="error">{(grantMut.error as Error).message}</Alert>}
          </Stack>
        )}
        {tab === 0 && verifyMut.isError && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">{(verifyMut.error as Error).message}</Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={close} disabled={busy}>
          Cerrar
        </Button>
        {tab === 0 ? (
          <Button variant="contained" onClick={() => verifyMut.mutate()} disabled={busy || !originBank || !paymentReference}>
            {verifyMut.isPending ? 'Verificando…' : 'Verificar'}
          </Button>
        ) : (
          <Button color="warning" variant="contained" onClick={() => grantMut.mutate()} disabled={busy || reason.trim().length < 3}>
            {grantMut.isPending ? 'Otorgando…' : 'Marcar pagada (manual)'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

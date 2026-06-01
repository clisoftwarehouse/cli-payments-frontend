import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Dialog,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { invoicesApi, type InvoiceDto } from '../../api/invoices-api';

type Props = {
  open: boolean;
  onClose: () => void;
  invoice: InvoiceDto;
};

export const CheckoutLinkDialog = ({ open, onClose, invoice }: Props) => {
  const checkoutUrl = invoice.checkoutToken ? invoicesApi.publicCheckoutUrl(invoice.checkoutToken) : '';
  const pdfUrl = invoicesApi.pdfUrl(invoice.id);

  const copy = (text: string) => void navigator.clipboard.writeText(text);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Factura emitida — {invoice.number}</DialogTitle>
      <DialogContent>
        <Alert severity="success" sx={{ mb: 2 }}>
          La factura está lista para enviar. El cliente paga desde el link de abajo.
        </Alert>

        <Stack spacing={2}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Link de pago (compártelo con tu cliente)
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField value={checkoutUrl} fullWidth size="small" InputProps={{ readOnly: true }} />
              <Tooltip title="Copiar link">
                <IconButton onClick={() => copy(checkoutUrl)}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Abrir en pestaña nueva">
                <IconButton component="a" href={checkoutUrl} target="_blank" rel="noreferrer">
                  <OpenInNewIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Token válido hasta:{' '}
              {invoice.checkoutTokenExpiresAt
                ? new Date(invoice.checkoutTokenExpiresAt).toLocaleString('es-VE')
                : '—'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="overline" color="text.secondary">
              Total
            </Typography>
            <Stack direction="row" spacing={2} alignItems="baseline">
              <Typography variant="h4" fontWeight={700}>
                {Number(invoice.displayAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}{' '}
                {invoice.displayCurrency}
              </Typography>
              {invoice.chargedAmount && invoice.chargedCurrency && (
                <Chip
                  label={`≈ ${Number(invoice.chargedAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })} ${invoice.chargedCurrency}`}
                  variant="outlined"
                />
              )}
            </Stack>
            {invoice.fxRateUsed && (
              <Typography variant="caption" color="text.secondary">
                Tasa snapshot: 1 {invoice.displayCurrency} ={' '}
                {Number(invoice.fxRateUsed).toLocaleString('es-VE', { minimumFractionDigits: 2 })}{' '}
                {invoice.chargedCurrency} ({invoice.fxRateSource}, {invoice.fxRateDate})
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button startIcon={<PictureAsPdfIcon />} component="a" href={pdfUrl} target="_blank" rel="noreferrer">
          Ver PDF
        </Button>
        <Button onClick={onClose} variant="contained">
          Listo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

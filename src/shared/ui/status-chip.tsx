import { Chip, type ChipProps } from '@mui/material';

type Color = ChipProps['color'];

// ── Invoice ──────────────────────────────────────────────────────────────────
const INVOICE_COLOR: Record<string, Color> = {
  draft: 'default',
  open: 'info',
  paid: 'success',
  void: 'warning',
  uncollectible: 'error',
};
const INVOICE_LABEL: Record<string, string> = {
  draft: 'Borrador',
  open: 'Abierta',
  paid: 'Pagada',
  void: 'Anulada',
  uncollectible: 'Incobrable',
};

// ── Payment ───────────────────────────────────────────────────────────────────
const PAYMENT_COLOR: Record<string, Color> = {
  pending: 'info',
  requires_otp: 'warning',
  requires_action: 'warning',
  succeeded: 'success',
  failed: 'error',
  canceled: 'default',
};
const PAYMENT_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  requires_otp: 'Requiere OTP',
  requires_action: 'Requiere acción',
  succeeded: 'Exitoso',
  failed: 'Fallido',
  canceled: 'Cancelado',
};

// ── Subscription ──────────────────────────────────────────────────────────────
const SUBSCRIPTION_COLOR: Record<string, Color> = {
  trialing: 'info',
  active: 'success',
  past_due: 'warning',
  canceled: 'default',
  unpaid: 'error',
  paused: 'default',
  canceling: 'warning',
};
const SUBSCRIPTION_LABEL: Record<string, string> = {
  trialing: 'En prueba',
  active: 'Activa',
  past_due: 'Vencida',
  canceled: 'Cancelada',
  unpaid: 'Sin pagar',
  paused: 'Pausada',
  canceling: 'Cancelando',
};

// ── Outbox ────────────────────────────────────────────────────────────────────
const OUTBOX_COLOR: Record<string, Color> = {
  pending: 'info',
  delivering: 'warning',
  delivered: 'success',
  giving_up: 'error',
};
const OUTBOX_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  delivering: 'Entregando',
  delivered: 'Entregado',
  giving_up: 'Abandonado',
};

// ── Boolean active ────────────────────────────────────────────────────────────
const BOOL_LABEL = (active: boolean, feminine = false) =>
  active ? (feminine ? 'Activa' : 'Activo') : feminine ? 'Inactiva' : 'Inactivo';

type StatusChipProps = {
  variant?: 'invoice' | 'payment' | 'subscription' | 'outbox' | 'active';
  status: string;
  size?: ChipProps['size'];
  feminine?: boolean;
};

export const StatusChip = ({ variant = 'payment', status, size = 'small', feminine }: StatusChipProps) => {
  let label: string;
  let color: Color;

  switch (variant) {
    case 'invoice':
      label = INVOICE_LABEL[status] ?? status;
      color = INVOICE_COLOR[status] ?? 'default';
      break;
    case 'subscription':
      label = SUBSCRIPTION_LABEL[status] ?? status;
      color = SUBSCRIPTION_COLOR[status] ?? 'default';
      break;
    case 'outbox':
      label = OUTBOX_LABEL[status] ?? status;
      color = OUTBOX_COLOR[status] ?? 'default';
      break;
    case 'active':
      label = BOOL_LABEL(status === 'true' || status === '1', feminine);
      color = status === 'true' || status === '1' ? 'success' : 'default';
      break;
    default:
      label = PAYMENT_LABEL[status] ?? status;
      color = PAYMENT_COLOR[status] ?? 'default';
  }

  return <Chip label={label} color={color} size={size} />;
};

export { INVOICE_LABEL, INVOICE_COLOR, PAYMENT_LABEL, PAYMENT_COLOR, SUBSCRIPTION_LABEL, SUBSCRIPTION_COLOR, OUTBOX_LABEL, OUTBOX_COLOR };

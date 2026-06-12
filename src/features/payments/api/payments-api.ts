import axiosClient from '@/shared/api/axios-client';

export type PaymentDto = {
  id: string;
  applicationId: string;
  customerId: string;
  invoiceId: string | null;
  idempotencyKey: string;
  status: 'pending' | 'requires_action' | 'requires_otp' | 'succeeded' | 'failed' | 'canceled';
  methodKind: 'c2p' | 'transfer' | 'pago_movil' | 'web_button' | 'zelle' | 'card_ccr' | 'manual';
  gateway: 'sitef' | 'zelle_manual' | 'manual';
  gatewayReference: string | null;
  displayCurrency: string;
  displayAmount: string;
  chargedCurrency: string | null;
  chargedAmount: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  succeededAt: string | null;
  failedAt: string | null;
  methodData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentAttemptDto = {
  id: string;
  paymentId: string;
  status: string;
  failureCode: string | null;
  failureMessage: string | null;
  otpState: Record<string, unknown> | null;
  rawRequest: Record<string, unknown> | null;
  rawResponse: Record<string, unknown> | null;
  nextPollAt: string | null;
  pollCount: number;
  settledAt: string | null;
  createdAt: string;
};

export const paymentsApi = {
  list: async (filters?: { status?: string; applicationId?: string }): Promise<PaymentDto[]> => {
    const { data } = await axiosClient.get<PaymentDto[]>('/payments', {
      params: { ...filters, limit: 50 },
    });
    return data;
  },
  findById: async (id: string): Promise<PaymentDto> => {
    const { data } = await axiosClient.get<PaymentDto>(`/payments/${id}`);
    return data;
  },
  listAttempts: async (id: string): Promise<PaymentAttemptDto[]> => {
    const { data } = await axiosClient.get<PaymentAttemptDto[]>(`/payments/${id}/attempts`);
    return data;
  },
  /** Verificación manual contra Sitef (transfer / pago_movil) para una factura open. */
  verify: async (input: {
    invoiceId: string;
    method: 'transfer' | 'pago_movil';
    methodData: Record<string, unknown>;
  }): Promise<PaymentDto> => {
    const { data } = await axiosClient.post<PaymentDto>('/payments/verify', input);
    return data;
  },
  /** Force-grant: marca la factura pagada sin cobrar (requiere motivo). */
  grant: async (input: { invoiceId: string; reason: string }): Promise<PaymentDto> => {
    const { data } = await axiosClient.post<PaymentDto>('/payments/grant', input);
    return data;
  },
};

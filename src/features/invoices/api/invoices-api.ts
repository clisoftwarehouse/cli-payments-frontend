import axiosClient from '@/shared/api/axios-client';

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
export type DisplayCurrency = 'EUR' | 'USD';

export type InvoiceItemDto = {
  id: string;
  invoiceId: string;
  productId: string | null;
  description: string;
  quantity: number;
  unitAmountEur: string;
  lineTotalEur: string;
  metadata: Record<string, unknown> | null;
};

export type InvoiceDto = {
  id: string;
  number: string | null;
  applicationId: string;
  customerId: string;
  status: InvoiceStatus;
  displayCurrency: DisplayCurrency;
  displayAmount: string;
  fxRateSource: string | null;
  fxRateUsed: string | null;
  fxRateDate: string | null;
  chargedCurrency: string | null;
  chargedAmount: string | null;
  dueDate: string | null;
  paidAt: string | null;
  checkoutToken: string | null;
  checkoutTokenExpiresAt: string | null;
  pdfUrl: string | null;
  notes: string | null;
  items: InvoiceItemDto[];
  createdAt: string;
  updatedAt: string;
};

export type CreateInvoiceInput = {
  applicationId: string;
  customerId: string;
  displayCurrency?: DisplayCurrency;
  items: Array<{
    productId?: string;
    description: string;
    quantity: number;
    unitAmountEur: string;
  }>;
  dueDate?: string;
  notes?: string;
};

export type GeneratePaymentLinkInput = {
  applicationId: string;
  amount: string;
  description: string;
  notes?: string;
  customer: {
    email: string;
    fullName: string;
    phone?: string;
    identityType?: 'rif' | 'cedula' | 'passport' | 'nif' | 'other';
    identityValue?: string;
  };
};

export type PaymentLinkResult = {
  invoice: InvoiceDto;
  checkoutUrl: string;
};

export const invoicesApi = {
  list: async (filters?: { status?: string; applicationId?: string; customerId?: string }): Promise<InvoiceDto[]> => {
    const { data } = await axiosClient.get<InvoiceDto[]>('/invoices', {
      params: { ...filters, limit: 100 },
    });
    return data;
  },

  generatePaymentLink: async (input: GeneratePaymentLinkInput): Promise<PaymentLinkResult> => {
    const { data } = await axiosClient.post<PaymentLinkResult>('/invoices/payment-link', input);
    return data;
  },
  findById: async (id: string): Promise<InvoiceDto> => {
    const { data } = await axiosClient.get<InvoiceDto>(`/invoices/${id}`);
    return data;
  },
  create: async (input: CreateInvoiceInput): Promise<InvoiceDto> => {
    const { data } = await axiosClient.post<InvoiceDto>('/invoices', input);
    return data;
  },
  issue: async (id: string): Promise<InvoiceDto> => {
    const { data } = await axiosClient.post<InvoiceDto>(`/invoices/${id}/issue`);
    return data;
  },
  pdfUrl: (id: string): string => `/api/v1/invoices/${id}/pdf`,
  publicCheckoutUrl: (token: string, landingBase?: string): string => {
    const base = landingBase ?? import.meta.env.VITE_LANDING_URL ?? 'https://clisoftwarehouse.com';
    return `${base}/pagar/${token}`;
  },
};

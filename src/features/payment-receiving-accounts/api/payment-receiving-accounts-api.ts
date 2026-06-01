import axiosClient from '@/shared/api/axios-client';

export type PaymentReceivingAccountDto = {
  id: string;
  applicationId: string;
  methodKind: 'transfer' | 'pago_movil';
  bankCode: number;
  bankName: string;
  accountHolder: string;
  identityDocument: string;
  accountNumber: string | null;
  accountType: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentReceivingAccountDto = {
  applicationId: string;
  methodKind: 'transfer' | 'pago_movil';
  bankCode: number;
  bankName: string;
  accountHolder: string;
  identityDocument: string;
  accountNumber?: string;
  accountType?: string;
  phone?: string;
};

export type UpdatePaymentReceivingAccountDto = Partial<Omit<CreatePaymentReceivingAccountDto, 'applicationId' | 'methodKind'> & { isActive: boolean }>;

export const paymentReceivingAccountsApi = {
  list: async (params?: { applicationId?: string; method?: string }): Promise<PaymentReceivingAccountDto[]> => {
    const { data } = await axiosClient.get<PaymentReceivingAccountDto[]>('/payment-receiving-accounts', { params });
    return data;
  },
  create: async (dto: CreatePaymentReceivingAccountDto): Promise<PaymentReceivingAccountDto> => {
    const { data } = await axiosClient.post<PaymentReceivingAccountDto>('/payment-receiving-accounts', dto);
    return data;
  },
  update: async (id: string, dto: UpdatePaymentReceivingAccountDto): Promise<PaymentReceivingAccountDto> => {
    const { data } = await axiosClient.patch<PaymentReceivingAccountDto>(`/payment-receiving-accounts/${id}`, dto);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/payment-receiving-accounts/${id}`);
  },
};

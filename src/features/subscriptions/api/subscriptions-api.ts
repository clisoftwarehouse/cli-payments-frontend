import axiosClient from '@/shared/api/axios-client';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'
  | 'canceling';

export type BillingCycle = 'monthly' | 'annual';

export type SubscriptionDto = {
  id: string;
  applicationId: string;
  customerId: string;
  productId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  gracePeriodUntil: string | null;
  scheduledProductId: string | null;
  scheduledBillingCycle: BillingCycle | null;
  scheduledAt: string | null;
  trialEndsAt: string | null;
  canceledAt: string | null;
  cancelReason: string | null;
  externalSubscriptionId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionEventDto = {
  id: string;
  subscriptionId: string;
  type: string;
  fromStatus: string | null;
  toStatus: string | null;
  triggeredBy: 'cron' | 'admin' | 'customer' | 'system' | 'webhook' | string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type SubscriptionFilters = {
  applicationId?: string;
  customerId?: string;
  status?: SubscriptionStatus;
};

export const subscriptionsApi = {
  list: async (filters?: SubscriptionFilters): Promise<SubscriptionDto[]> => {
    const { data } = await axiosClient.get<SubscriptionDto[]>('/subscriptions', {
      params: { ...filters, limit: 50 },
    });
    return data;
  },
  findById: async (id: string): Promise<SubscriptionDto> => {
    const { data } = await axiosClient.get<SubscriptionDto>(`/subscriptions/${id}`);
    return data;
  },
  listEvents: async (id: string): Promise<SubscriptionEventDto[]> => {
    const { data } = await axiosClient.get<SubscriptionEventDto[]>(`/subscriptions/${id}/events`);
    return data;
  },
  resendWebhook: async (id: string): Promise<{ deliveryIds: string[] }> => {
    const { data } = await axiosClient.post<{ deliveryIds: string[] }>(`/subscriptions/${id}/resend-webhook`);
    return data;
  },
};

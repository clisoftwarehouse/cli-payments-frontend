import axiosClient from '@/shared/api/axios-client';

export type OutboxDeliveryStatus = 'pending' | 'delivering' | 'delivered' | 'giving_up';
export type OutboxTargetType = 'webhook_endpoint' | 'internal_handler';

export type OutboxDeliveryDto = {
  id: string;
  eventId: string;
  targetType: OutboxTargetType;
  targetId: string | null;
  targetDescriptor: string | null;
  status: OutboxDeliveryStatus;
  attempts: number;
  nextAttemptAt: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  lastResponseStatus: number | null;
  lastResponseBody: string | null;
  deliveredAt: string | null;
  givenUpAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OutboxEventDto = {
  id: string;
  applicationId: string;
  aggregateType: 'subscription' | 'invoice' | 'payment' | 'customer';
  aggregateId: string;
  eventKind: string;
  deliveryKey: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type OutboxDeliveryFilters = {
  status?: OutboxDeliveryStatus;
  target_type?: OutboxTargetType;
  limit?: number;
  offset?: number;
};

export const outboxApi = {
  listDeliveries: async (filters?: OutboxDeliveryFilters): Promise<OutboxDeliveryDto[]> => {
    const { data } = await axiosClient.get<OutboxDeliveryDto[]>('/admin/outbox/deliveries', {
      params: { limit: 100, offset: 0, ...filters },
    });
    return data;
  },

  getDelivery: async (
    id: string,
  ): Promise<{ event: OutboxEventDto; delivery: OutboxDeliveryDto }> => {
    const { data } = await axiosClient.get(`/admin/outbox/deliveries/${id}`);
    return data;
  },

  replay: async (id: string): Promise<OutboxDeliveryDto> => {
    const { data } = await axiosClient.post<OutboxDeliveryDto>(
      `/admin/outbox/deliveries/${id}/replay`,
    );
    return data;
  },

  getEventWithDeliveries: async (
    id: string,
  ): Promise<{ event: OutboxEventDto; deliveries: OutboxDeliveryDto[] }> => {
    const { data } = await axiosClient.get(`/admin/outbox/events/${id}`);
    return data;
  },

  listInternalHandlers: async (): Promise<{ descriptors: string[] }> => {
    const { data } = await axiosClient.get('/admin/outbox/internal-handlers');
    return data;
  },
};

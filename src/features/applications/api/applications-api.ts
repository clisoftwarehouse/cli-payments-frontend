import axiosClient from '@/shared/api/axios-client';

export type ApplicationMode = 'live' | 'test';

export type ApplicationDto = {
  id: string;
  slug: string;
  name: string;
  mode: ApplicationMode;
  isActive: boolean;
  websiteUrl: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateApplicationInput = {
  slug: string;
  name: string;
  mode?: ApplicationMode;
  websiteUrl?: string;
  contactEmail?: string;
};

export type ApiKeyDto = {
  id: string;
  applicationId: string;
  publicId: string;
  label: string;
  scopes: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type ApiKeyWithSecretDto = ApiKeyDto & { secret: string };

export type WebhookEndpointDto = {
  id: string;
  applicationId: string;
  url: string;
  activeEvents: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WebhookEndpointWithSecretDto = WebhookEndpointDto & { signingSecret: string };

export const WEBHOOK_EVENTS = [
  'payment.succeeded',
  'payment.failed',
  'invoice.issued',
  'invoice.paid',
  'subscription.renewed',
  'subscription.past_due',
  'subscription.canceled',
  'subscription.renewal_due',
  'subscription.plan_changed',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];

export type UpdateApplicationInput = Partial<CreateApplicationInput> & {
  isActive?: boolean;
};

export const applicationsApi = {
  list: async (): Promise<ApplicationDto[]> => {
    const { data } = await axiosClient.get<ApplicationDto[]>('/applications');
    return data;
  },
  findById: async (id: string): Promise<ApplicationDto> => {
    const { data } = await axiosClient.get<ApplicationDto>(`/applications/${id}`);
    return data;
  },
  create: async (input: CreateApplicationInput): Promise<ApplicationDto> => {
    const { data } = await axiosClient.post<ApplicationDto>('/applications', input);
    return data;
  },
  update: async (id: string, input: UpdateApplicationInput): Promise<ApplicationDto> => {
    const { data } = await axiosClient.patch<ApplicationDto>(`/applications/${id}`, input);
    return data;
  },
  listApiKeys: async (applicationId: string): Promise<ApiKeyDto[]> => {
    const { data } = await axiosClient.get<ApiKeyDto[]>(`/applications/${applicationId}/api-keys`);
    return data;
  },
  createApiKey: async (
    applicationId: string,
    body: { label: string; scopes: string[] },
  ): Promise<ApiKeyWithSecretDto> => {
    const { data } = await axiosClient.post<ApiKeyWithSecretDto>(`/applications/${applicationId}/api-keys`, body);
    return data;
  },
  revokeApiKey: async (keyId: string): Promise<void> => {
    await axiosClient.delete(`/applications/api-keys/${keyId}`);
  },
  listWebhookEndpoints: async (applicationId: string): Promise<WebhookEndpointDto[]> => {
    const { data } = await axiosClient.get<WebhookEndpointDto[]>(`/applications/${applicationId}/webhook-endpoints`);
    return data;
  },
  createWebhookEndpoint: async (
    applicationId: string,
    body: { url: string; activeEvents: WebhookEventType[] },
  ): Promise<WebhookEndpointWithSecretDto> => {
    const { data } = await axiosClient.post<WebhookEndpointWithSecretDto>(
      `/applications/${applicationId}/webhook-endpoints`,
      body,
    );
    return data;
  },
};

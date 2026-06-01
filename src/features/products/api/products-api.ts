import axiosClient from '@/shared/api/axios-client';

export type ProductKind = 'subscription_plan' | 'dev_project' | 'audit' | 'maintenance' | 'addon' | 'one_shot';
export type PriceCurrency = 'EUR' | 'USD';
export type BillingInterval = 'monthly' | 'annual' | null;

export type ProductDto = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  kind: ProductKind;
  priceCurrency: PriceCurrency;
  priceAmount: string;
  billingInterval: BillingInterval;
  isActive: boolean;
  planFeatures: Record<string, unknown> | null;
  applicationId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  sku: string;
  name: string;
  description?: string;
  kind: ProductKind;
  priceCurrency: PriceCurrency;
  priceAmount: string;
  billingInterval?: 'monthly' | 'annual';
  isActive?: boolean;
  applicationId?: string;
};

export type UpdateProductInput = Partial<CreateProductInput> & { isActive?: boolean };

export const productsApi = {
  list: async (): Promise<ProductDto[]> => {
    const { data } = await axiosClient.get<ProductDto[]>('/products', { params: { limit: 100 } });
    return data;
  },
  findById: async (id: string): Promise<ProductDto> => {
    const { data } = await axiosClient.get<ProductDto>(`/products/${id}`);
    return data;
  },
  create: async (input: CreateProductInput): Promise<ProductDto> => {
    const { data } = await axiosClient.post<ProductDto>('/products', input);
    return data;
  },
  update: async (id: string, input: UpdateProductInput): Promise<ProductDto> => {
    const { data } = await axiosClient.patch<ProductDto>(`/products/${id}`, input);
    return data;
  },
};

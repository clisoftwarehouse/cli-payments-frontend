import axiosClient from '@/shared/api/axios-client';

export type IdentityType = 'rif' | 'cedula' | 'passport' | 'nif' | 'other';

export type CustomerDto = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  country: string;
  identityType: IdentityType | null;
  identityValue: string | null;
  legalName: string | null;
  address: string | null;
  defaultLocale: string;
  createdAt: string;
  updatedAt: string;
};

export type UpsertCustomerInput = {
  email: string;
  fullName: string;
  phone?: string;
  country?: string;
  identityType?: IdentityType;
  identityValue?: string;
  legalName?: string;
  address?: string;
  defaultLocale?: string;
};

export const customersApi = {
  list: async (search?: string): Promise<CustomerDto[]> => {
    const { data } = await axiosClient.get<CustomerDto[]>('/customers', { params: { search, limit: 50 } });
    return data;
  },
  findById: async (id: string): Promise<CustomerDto> => {
    const { data } = await axiosClient.get<CustomerDto>(`/customers/${id}`);
    return data;
  },
  upsert: async (input: UpsertCustomerInput): Promise<CustomerDto> => {
    const { data } = await axiosClient.post<CustomerDto>('/customers', input);
    return data;
  },
};

import axiosClient from '@/shared/api/axios-client';

export type BankDto = {
  id: string;
  ibpCode: string;
  name: string;
  shortName: string | null;
  c2pEnabled: boolean;
  transferEnabled: boolean;
  isActive: boolean;
};

export const banksApi = {
  list: async (): Promise<BankDto[]> => {
    const { data } = await axiosClient.get<BankDto[]>('/public/banks');
    return data;
  },
};

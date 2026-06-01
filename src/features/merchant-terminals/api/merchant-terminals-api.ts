import axiosClient from '@/shared/api/axios-client';

export type MerchantTerminalDto = {
  id: string;
  applicationId: string;
  label: string;
  sitefUsername: string;
  sitefIdBranch: number;
  sitefCodeStall: string;
  acquirerBank: number;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMerchantTerminalInput = {
  applicationId: string;
  label: string;
  sitefUsername: string;
  sitefPassword: string;
  sitefIdBranch: number;
  sitefCodeStall: string;
  acquirerBank: number;
  notes?: string;
};

export const merchantTerminalsApi = {
  list: async (applicationId: string): Promise<MerchantTerminalDto[]> => {
    const { data } = await axiosClient.get<MerchantTerminalDto[]>('/merchant-terminals', {
      params: { applicationId },
    });
    return data;
  },

  create: async (input: CreateMerchantTerminalInput): Promise<MerchantTerminalDto> => {
    const { data } = await axiosClient.post<MerchantTerminalDto>('/merchant-terminals', input);
    return data;
  },

  setActive: async (id: string, value: boolean): Promise<MerchantTerminalDto> => {
    const { data } = await axiosClient.patch<MerchantTerminalDto>(
      `/merchant-terminals/${id}/active`,
      undefined,
      { params: { value } },
    );
    return data;
  },
};

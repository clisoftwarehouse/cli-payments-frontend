import axiosClient from '@/shared/api/axios-client';

export type FxCurrency = 'EUR' | 'USD';

export type FxRateDto = {
  currency: FxCurrency;
  rate: string;
  source: 'BCV' | 'YADIO' | 'EXCHANGEDYN' | 'MANUAL';
  effectiveDate: string;
  fetchedAt: string;
  createdAt: string;
  updatedAt: string;
};

export const fxApi = {
  latest: async (currency: FxCurrency): Promise<FxRateDto> => {
    const { data } = await axiosClient.get<FxRateDto>('/fx-rates/latest', { params: { currency } });
    return data;
  },

  history: async (currency: FxCurrency): Promise<FxRateDto[]> => {
    const { data } = await axiosClient.get<FxRateDto[]>('/fx-rates', { params: { currency } });
    return data;
  },

  refresh: async (): Promise<Array<{ currency: FxCurrency; rate: string | null; source: string | null }>> => {
    const { data } = await axiosClient.post('/fx-rates/refresh');
    return data;
  },
};

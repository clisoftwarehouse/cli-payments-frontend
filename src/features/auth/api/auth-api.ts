import axiosClient from '@/shared/api/axios-client';

import type { LoginInput, LoginResponse } from '../model/auth-types';

export const authApi = {
  login: async (input: LoginInput): Promise<LoginResponse> => {
    const { data } = await axiosClient.post<LoginResponse>('/auth/email/login', input);
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  },
};

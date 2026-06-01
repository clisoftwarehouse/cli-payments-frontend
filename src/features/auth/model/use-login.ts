import { useMutation } from '@tanstack/react-query';

import { authApi } from '../api/auth-api';
import { useAuthStore } from './auth-store';

import type { LoginInput, LoginResponse } from './auth-types';

export const useLogin = () => {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: (input) => authApi.login(input),
    onSuccess: (data) => {
      setSession({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
        user: data.user,
      });
    },
  });
};

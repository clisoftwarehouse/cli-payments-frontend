import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthUser } from './auth-types';

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  tokenExpires: number | null;
  user: AuthUser | null;

  setSession: (params: { token: string; refreshToken: string; tokenExpires: number; user: AuthUser }) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      tokenExpires: null,
      user: null,

      setSession: ({ token, refreshToken, tokenExpires, user }) => set({ token, refreshToken, tokenExpires, user }),

      clear: () => set({ token: null, refreshToken: null, tokenExpires: null, user: null }),

      isAuthenticated: () => {
        const { token, tokenExpires } = get();
        if (!token) return false;
        if (tokenExpires && Date.now() > tokenExpires) return false;
        return true;
      },
    }),
    { name: 'cli-payments-auth' }
  )
);

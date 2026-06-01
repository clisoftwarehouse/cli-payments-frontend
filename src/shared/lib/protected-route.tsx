import { Navigate, useLocation } from 'react-router';

import { useAuthStore } from '@/features/auth/model/auth-store';

type Props = { children: React.ReactNode };

export const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => Boolean(s.token));

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

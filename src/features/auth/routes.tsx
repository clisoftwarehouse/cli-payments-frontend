import { type RouteObject } from 'react-router';

import { LoginPage } from './ui/pages/login-page';
import { AuthLayout } from '@/pages/layouts/auth-layout';

export const authRoutes: RouteObject = {
  path: 'auth',
  element: <AuthLayout />,
  children: [{ path: 'login', element: <LoginPage /> }],
};

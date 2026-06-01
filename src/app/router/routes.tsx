import { Suspense } from 'react';
import { Outlet, type RouteObject } from 'react-router';

import { CircularProgress, Box } from '@mui/material';

import { fxRoutes } from '@/features/fx/routes';
import { homeRoutes } from '@/features/home/routes';
import { authRoutes } from '@/features/auth/routes';
import { banksRoutes } from '@/features/banks/routes';
import { usersRoutes } from '@/features/users/routes';
import { outboxRoutes } from '@/features/outbox/routes';
import { customersRoutes } from '@/features/customers/routes';
import { invoicesRoutes } from '@/features/invoices/routes';
import { paymentsRoutes } from '@/features/payments/routes';
import { productsRoutes } from '@/features/products/routes';
import { reportsRoutes } from '@/features/reports/routes';
import { applicationsRoutes } from '@/features/applications/routes';
import { subscriptionsRoutes } from '@/features/subscriptions/routes';
import { paymentLinksRoutes } from '@/features/payment-links/routes';
import { paymentReceivingAccountsRoutes } from '@/features/payment-receiving-accounts/routes';
import { DashboardLayout } from '@/pages/layouts/dashboard-layout';
import { ProtectedRoute } from '@/shared/lib/protected-route';

const renderFallback = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

export const appRoutes: RouteObject[] = [
  {
    element: (
      <Suspense fallback={renderFallback()}>
        <Outlet />
      </Suspense>
    ),
    children: [
      authRoutes,
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          homeRoutes,
          applicationsRoutes,
          customersRoutes,
          productsRoutes,
          subscriptionsRoutes,
          invoicesRoutes,
          paymentsRoutes,
          paymentLinksRoutes,
          paymentReceivingAccountsRoutes,
          outboxRoutes,
          fxRoutes,
          banksRoutes,
          usersRoutes,
          reportsRoutes,
        ],
      },
    ],
  },
];

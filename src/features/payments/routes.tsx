import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const PaymentsPage = lazy(() => import('./ui/pages/payments-page'));

export const paymentsRoutes: RouteObject = {
  path: 'payments',
  children: [{ index: true, element: <PaymentsPage /> }],
};

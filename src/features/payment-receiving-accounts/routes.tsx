import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const PaymentReceivingAccountsPage = lazy(() => import('./ui/pages/payment-receiving-accounts-page'));

export const paymentReceivingAccountsRoutes: RouteObject = {
  path: 'payment-accounts',
  element: <PaymentReceivingAccountsPage />,
};

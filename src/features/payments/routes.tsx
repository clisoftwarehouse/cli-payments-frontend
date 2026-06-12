import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const PaymentsPage = lazy(() => import('./ui/pages/payments-page'));
const ManualVerificationPage = lazy(() => import('./ui/pages/manual-verification-page'));

export const paymentsRoutes: RouteObject = {
  path: 'payments',
  children: [{ index: true, element: <PaymentsPage /> }],
};

export const manualVerificationRoutes: RouteObject = {
  path: 'manual-verification',
  children: [{ index: true, element: <ManualVerificationPage /> }],
};

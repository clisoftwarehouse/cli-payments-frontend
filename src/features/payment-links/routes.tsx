import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const PaymentLinksPage = lazy(() => import('./ui/pages/payment-links-page'));

export const paymentLinksRoutes: RouteObject = {
  path: 'payment-links',
  element: <PaymentLinksPage />,
};

import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const SubscriptionsPage = lazy(() => import('./ui/pages/subscriptions-page'));
const SubscriptionDetailPage = lazy(() => import('./ui/pages/subscription-detail-page'));

export const subscriptionsRoutes: RouteObject = {
  path: 'subscriptions',
  children: [
    { index: true, element: <SubscriptionsPage /> },
    { path: ':id', element: <SubscriptionDetailPage /> },
  ],
};

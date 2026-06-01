import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const OutboxPage = lazy(() => import('./ui/pages/outbox-page'));

export const outboxRoutes: RouteObject = {
  path: 'outbox',
  children: [{ index: true, element: <OutboxPage /> }],
};

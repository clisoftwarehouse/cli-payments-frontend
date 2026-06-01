import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const ReportsPage = lazy(() => import('./ui/pages/reports-page'));

export const reportsRoutes: RouteObject = {
  path: 'reports',
  children: [{ index: true, element: <ReportsPage /> }],
};

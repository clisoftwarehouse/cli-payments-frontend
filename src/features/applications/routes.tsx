import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const ApplicationsPage = lazy(() => import('./ui/pages/applications-page'));
const ApplicationDetailPage = lazy(() => import('./ui/pages/application-detail-page'));

export const applicationsRoutes: RouteObject = {
  path: 'applications',
  children: [
    { index: true, element: <ApplicationsPage /> },
    { path: ':id', element: <ApplicationDetailPage /> },
  ],
};

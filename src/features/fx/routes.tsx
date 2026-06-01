import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const FxPage = lazy(() => import('./ui/pages/fx-page'));

export const fxRoutes: RouteObject = {
  path: 'fx',
  children: [{ index: true, element: <FxPage /> }],
};

import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const BanksPage = lazy(() => import('./ui/pages/banks-page'));

export const banksRoutes: RouteObject = {
  path: 'banks',
  children: [{ index: true, element: <BanksPage /> }],
};

import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const UsersPage = lazy(() => import('./ui/pages/users-page'));

export const usersRoutes: RouteObject = {
  path: 'users',
  children: [{ index: true, element: <UsersPage /> }],
};

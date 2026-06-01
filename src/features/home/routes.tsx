import { type RouteObject } from 'react-router';

import { DashboardPage } from './ui/pages';

export const homeRoutes: RouteObject = {
  index: true,
  element: <DashboardPage />,
};

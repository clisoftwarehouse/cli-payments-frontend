import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const CustomersPage = lazy(() => import('./ui/pages/customers-page'));
const CustomerDetailPage = lazy(() => import('./ui/pages/customer-detail-page'));

export const customersRoutes: RouteObject = {
  path: 'customers',
  children: [
    { index: true, element: <CustomersPage /> },
    { path: ':id', element: <CustomerDetailPage /> },
  ],
};

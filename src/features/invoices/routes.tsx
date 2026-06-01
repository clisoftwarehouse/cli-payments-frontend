import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const InvoicesPage = lazy(() => import('./ui/pages/invoices-page'));
const InvoiceDetailPage = lazy(() => import('./ui/pages/invoice-detail-page'));

export const invoicesRoutes: RouteObject = {
  path: 'invoices',
  children: [
    { index: true, element: <InvoicesPage /> },
    { path: ':id', element: <InvoiceDetailPage /> },
  ],
};

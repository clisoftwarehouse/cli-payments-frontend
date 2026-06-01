import { lazy } from 'react';
import { type RouteObject } from 'react-router';

const ProductsPage = lazy(() => import('./ui/pages/products-page'));

export const productsRoutes: RouteObject = {
  path: 'products',
  children: [{ index: true, element: <ProductsPage /> }],
};

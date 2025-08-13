// src/router/route-names.ts
export const RouteName = {
  Dashboard: 'dashboard',
  CatalogProducts: 'catalog-products',
  CatalogCategories: 'catalog-categories',
  Orders: 'orders',
  Customers: 'customers',
  Reports: 'reports',
  Discounts: 'discounts',
  Users: 'users',
  Settings: 'settings',
  NotFound: 'not-found',
} as const;

export type RouteNameKey = keyof typeof RouteName;

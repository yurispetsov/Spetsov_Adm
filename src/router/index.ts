// Маршруты с ACL метаданными
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      { path: '', redirect: { name: 'Dashboard' } },
      { path: 'dashboard', name: 'Dashboard', meta: { page: 'dashboard', requires: 'read' }, component: () => import('@/pages/dashboard/DashboardPage.vue') },
      { path: 'products',  name: 'Products',  meta: { page: 'products',  requires: 'read' }, component: () => import('@/pages/products/ProductsPage.vue') },
      { path: 'catalog/categories', name: 'Categories', meta: { page: 'categories', requires: 'read' }, component: () => import('@/pages/categories/CategoriesPage.vue') },
      { path: 'clients',   name: 'Clients',   meta: { page: 'clients',   requires: 'read' }, component: () => import('@/pages/clients/ClientsPage.vue') },
      { path: 'orders',    name: 'Orders',    meta: { page: 'orders',    requires: 'read' }, component: () => import('@/pages/orders/OrdersPage.vue') },
      { path: 'discounts', name: 'Discounts', meta: { page: 'discounts', requires: 'read' }, component: () => import('@/pages/discounts/DiscountsPage.vue') },
      { path: 'users',     name: 'Users',     meta: { page: 'users',     requires: 'read' }, component: () => import('@/pages/users/UsersPage.vue') },
      { path: 'settings',  name: 'Settings',  meta: { page: 'settings',  requires: 'read' }, component: () => import('@/pages/settings/SettingsPage.vue') },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

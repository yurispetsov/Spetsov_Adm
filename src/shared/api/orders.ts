import { api } from './client';
import type { Order, OrderBrief, OrderStatus } from '@/types/order';

export interface OrdersQuery {
  page?: number; perPage?: number;
  search?: string;
  sort?: 'updated'|'total'|'customer'|'status';
  status?: OrderStatus | 'all';
  delivery?: 'all'|'pickup'|'courier';
}

export interface Page<T> { items: T[]; page: number; perPage: number; total: number; }

export async function listOrders(q: OrdersQuery): Promise<Page<OrderBrief>> {
  const { data } = await api.get('/orders', { params: q });
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await api.patch(`/orders/${id}`, { status });
}

export async function addOrderDoc(id: string, form: FormData) {
  const { data } = await api.post(`/orders/${id}/docs`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data as { id: string; title: string; url: string };
}

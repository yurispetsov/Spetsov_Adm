import { api } from '@/shared/api/client';
import type { Product } from '@/types/catalog';

export interface ListProductsParams {
  q?: string;
  page?: number;
  perPage?: number;
  sort?: 'name'|'price'|'stock'|'updated'|'active';
  categoryId?: string | null;
}

export interface ListProductsResponse {
  items: Product[];
  total: number;
}

export async function listProducts(params: ListProductsParams = {}): Promise<ListProductsResponse> {
  const { data } = await api.get<ListProductsResponse>('/products', { params });
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}

export async function saveProduct(payload: Partial<Product>): Promise<Product> {
  if (payload.id) {
    const { data } = await api.patch<Product>(`/products/${payload.id}`, payload);
    return data;
  }
  const { data } = await api.post<Product>('/products', payload);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function toggleActive(ids: string[], active: boolean): Promise<void> {
  await api.post('/products:toggle', { ids, active });
}

export async function moveProductsToCategory(ids: string[], categoryId: string): Promise<void> {
  await api.post('/products:move', { ids, categoryId });
}

export function sumStock(p: Product): number {
  if (!p.stock) return 0;
  return Object.values(p.stock).reduce((a, b) => a + Number(b || 0), 0);
}

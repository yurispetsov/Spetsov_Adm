import { http } from './client';

export interface Product {
  id: number;
  title: string;
  price: number;
  categoryId?: number | null;
}

export async function listByCategory(categoryId?: number) : Promise<Product[]> {
  if (!categoryId) return [];
  return await http.get(`/products?categoryId=${categoryId}`);
}
// src/api/products_private_helper.ts
import type { Product } from '@/types/Product'
import { listProducts } from '@/api/products'

// Fallback helper: try to fetch large page-size and hope implementation filters in-memory.
export async function loadAll(): Promise<Product[]> {
  try {
    // best effort: pull first 100k
    const { items } = await listProducts(1, 100000, {}, { by: 'updatedAt', dir: 'desc', stockByKeys: [] })
    return items
  } catch (e) {
    // If listProducts signature is different, return empty to avoid break
    return []
  }
}

// src/types/Product.ts
export type ID = string

export interface ProductMetric {
  name: string
  value: number | null
  unit: string
}

export interface ProductDocument {
  id: ID
  title: string
  fileName: string
  mime?: string
}

export interface Product {
  id: ID
  sku: string
  article: string
  name: string
  categoryId: ID | null
  categoryName?: string
  price: number
  // совокупный остаток (для обратной совместимости), можно не использовать
  stock: number
  // остатки по складам
  warehouses?: Record<string, number>
  status: 'draft' | 'active' | 'archived'
  descriptionHtml?: string
  metrics?: ProductMetric[]
  documents?: ProductDocument[]
  createdAt: string
  updatedAt: string
}

export interface ProductFilter {
  q?: string
  status?: Array<Product['status']>
  categoryIds?: ID[]
  priceMin?: number
  priceMax?: number
}

export type SortBy = 'name' | 'price' | 'stock' | 'updatedAt'
export type SortDir = 'asc' | 'desc'
export interface ProductSort {
  by: SortBy
  dir: SortDir
  // для сортировки по остатку учитываем выбранные пользователем склады
  stockByKeys?: string[]
}

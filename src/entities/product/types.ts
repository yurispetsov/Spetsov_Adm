export type ID = string
export type Money = { amount: number; currency: string }

export type MediaItem = { id?: ID; url: string; alt?: string; sort?: number }

export type Variant = {
  id?: ID
  sku: string
  options: Record<string, string> // e.g. { color: 'red', size: 'M' }
  price?: Money
  stock?: number
}

export type Product = {
  id?: ID
  sku: string
  title: string
  slug?: string
  description?: string
  status: 'draft'|'active'|'archived'
  price: Money
  categories: ID[]
  attributes: Record<string, string | number>
  variants?: Variant[]
  media: MediaItem[]
  createdAt?: string
  updatedAt?: string
}

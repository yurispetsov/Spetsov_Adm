export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sort: number;
  visible: boolean;
}

export interface ProductStock {
  [warehouseId: string]: number;
}

export interface Product {
  id: string;
  article?: string;
  sku?: string;
  name: string;
  price: number;
  stock?: ProductStock;
  categoryId?: string | null;
  active: boolean;
  updatedAt?: string;
  description?: string;
}

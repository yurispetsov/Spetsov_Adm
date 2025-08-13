// src/types/Category.ts
export type ID = string

export interface Category {
  id: ID
  name: string
  slug: string
  parentId: ID | null
  sort: number
  isVisible: boolean
  productCount: number
  createdAt: string
  updatedAt: string
}

export interface CategoryInput {
  name: string
  slug?: string
  parentId: ID | null
  isVisible?: boolean
}

export interface CategoryMove {
  id: ID
  newParentId: ID | null
  newIndex?: number // позиция внутри нового родителя
}

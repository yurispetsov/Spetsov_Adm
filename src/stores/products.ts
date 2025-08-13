// src/stores/products.ts
import { defineStore } from 'pinia'
import type { Product, ProductFilter, ID, ProductSort, SortBy, SortDir } from '@/types/Product'
import { listProducts, createProduct, updateProduct, deleteProduct, bulkDelete, bulkAssignCategory } from '@/api/products'

export const useProductsStore = defineStore('products', {
  state: () => ({
    items: [] as Product[],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
    selection: [] as ID[],
    filter: {} as ProductFilter,
    sort: { by: 'updatedAt' as SortBy, dir: 'desc' as SortDir, stockByKeys: [] as string[] } as ProductSort,
    availableWarehouses: [] as string[],
  }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const { items, total } = await listProducts(this.page, this.pageSize, this.filter, this.sort)
        this.items = items
        this.total = total
        const set = new Set<string>(this.availableWarehouses)
        for (const p of items) {
          if (p.warehouses) for (const k of Object.keys(p.warehouses)) set.add(k)
        }
        this.availableWarehouses = Array.from(set)
      } finally {
        this.loading = false
      }
    },
    async create(payload: Omit<Product,'id'|'createdAt'|'updatedAt'|'stock'>) {
      await createProduct(payload)
      await this.fetch()
    },
    async update(id: ID, patch: Partial<Product>) {
      await updateProduct(id, patch)
      await this.fetch()
    },
    async remove(id: ID) {
      await deleteProduct(id)
      await this.fetch()
    },
    async removeSelected() {
      if (!this.selection.length) return
      await bulkDelete(this.selection)
      this.selection = []
      await this.fetch()
    },
    async assignToCategory(ids: ID[], categoryId: ID | null) {
      await bulkAssignCategory(ids, categoryId)
      await this.fetch()
    },
    setPage(p: number) { this.page = p; },
    setPageSize(n: number) { this.pageSize = n; },
    setFilter(f: ProductFilter) { this.filter = { ...f }; this.page = 1; },
    setSort(by: SortBy) {
      if (this.sort.by === by) {
        this.sort.dir = this.sort.dir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sort.by = by
        this.sort.dir = by === 'name' ? 'asc' : 'desc'
      }
      this.page = 1
    },
    setStockSortKeys(keys: string[]) {
      this.sort.stockByKeys = [...keys]
      this.page = 1
    },
    toggleSelect(id: ID) {
      const i = this.selection.indexOf(id)
      if (i >= 0) this.selection.splice(i,1); else this.selection.push(id)
    },
    setSelection(ids: ID[], checked: boolean) {
      if (checked) {
        const set = new Set(this.selection)
        ids.forEach(id => set.add(id))
        this.selection = Array.from(set)
      } else {
        this.selection = this.selection.filter(id => !ids.includes(id))
      }
    },
    clearSelection() { this.selection = [] },
  }
})

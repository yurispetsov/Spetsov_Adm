import { defineStore } from 'pinia';
import { listProducts, deleteProduct, toggleActive, moveProductsToCategory, saveProduct } from '@/api/products';
import type { Product } from '@/types/catalog';

export const useProductsStore = defineStore('products', {
  state: () => ({
    items: [] as Product[],
    total: 0,
    q: '',
    sort: 'name' as 'name'|'price'|'stock'|'updated'|'active',
    page: 1,
    perPage: 25,
    categoryId: null as string | null,
    selected: new Set<string>(),
    loading: false,
    editing: null as Product | null,
  }),
  actions: {
    async fetch() {
      this.loading = true;
      try {
        const { items, total } = await listProducts({
          q: this.q, sort: this.sort, page: this.page, perPage: this.perPage, categoryId: this.categoryId
        });
        this.items = items;
        this.total = total;
        // чистим выбранные
        const ids = new Set(items.map(i=>i.id));
        this.selected.forEach(id => { if (!ids.has(id)) this.selected.delete(id); });
      } finally {
        this.loading = false;
      }
    },
    setQuery(q: string){ this.q = q; this.page = 1; },
    setSort(s: 'name'|'price'|'stock'|'updated'|'active'){ this.sort = s; },
    setCategory(id: string | null){ this.categoryId = id; this.page = 1; },
    toggleSelect(id: string, flag: boolean){ flag ? this.selected.add(id) : this.selected.delete(id); },
    clearSelection(){ this.selected.clear(); },
    async removeOne(id: string){ await deleteProduct(id); await this.fetch(); },
    async removeSelected(){ if (!this.selected.size) return; await Promise.all(Array.from(this.selected).map(deleteProduct)); this.clearSelection(); await this.fetch(); },
    async setActive(flag: boolean){ if (!this.selected.size) return; await toggleActive(Array.from(this.selected), flag); await this.fetch(); },
    async moveSelected(categoryId: string){ if (!this.selected.size) return; await moveProductsToCategory(Array.from(this.selected), categoryId); this.clearSelection(); await this.fetch(); },
    startEdit(p?: Product){ this.editing = p ? { ...p } : { id: '', name: '', price: 0, active: true } as Product; },
    async saveEditing(payload: Partial<Product>){ await saveProduct(payload); this.editing = null; await this.fetch(); }
  }
});

import { defineStore } from 'pinia';
import { listCategories, createCategory, updateCategory, deleteCategory } from '@/api/categories';
import type { Category } from '@/types/catalog';

function toTree(items: Category[]): any[] {
  const byParent: Record<string, Category[]> = {};
  for (const c of items) {
    const k = c.parentId || 'root';
    (byParent[k] ||= []).push(c);
  }
  const build = (pid: string|null): any[] => {
    const arr = byParent[pid || 'root'] || [];
    return arr.sort((a,b)=>a.sort-b.sort).map(n => ({ node: n, children: build(n.id) }));
  };
  return build(null);
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    items: [] as Category[],
    selectedId: null as string | null,
    loading: false as boolean,
  }),
  getters: {
    tree(state): any[] { return toTree(state.items); },
    selected(state): Category | null {
      return state.items.find(x => x.id === state.selectedId) || null;
    }
  },
  actions: {
    async fetch() {
      this.loading = true;
      try {
        this.items = await listCategories();
        if (this.selectedId && !this.items.find(x=>x.id===this.selectedId)) this.selectedId = null;
      } finally {
        this.loading = false;
      }
    },
    select(id: string | null) {
      this.selectedId = id;
    },
    async create(payload: Partial<Category>) {
      const c = await createCategory(payload);
      this.items.push(c);
      this.selectedId = c.id;
    },
    async update(id: string, payload: Partial<Category>) {
      const c = await updateCategory(id, payload);
      const i = this.items.findIndex(x => x.id === id);
      if (i >= 0) this.items[i] = c;
    },
    async remove(id: string) {
      await deleteCategory(id);
      this.items = this.items.filter(x => x.id !== id);
      if (this.selectedId === id) this.selectedId = null;
    }
  }
});

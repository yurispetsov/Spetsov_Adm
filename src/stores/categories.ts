// src/stores/categories.ts
import { defineStore } from 'pinia'
import type { Category, ID } from '@/types/Category'
import { listCategories, createCategory, updateCategory, deleteCategory, moveCategory, slugify } from '@/api/categories'

export interface TreeNode extends Category {
  children: TreeNode[]
}

function buildTree(flat: Category[], search: string) {
  const byId = new Map<string, TreeNode>()
  const roots: TreeNode[] = []
  const q = search.trim().toLowerCase()

  for (const c of flat) {
    const node: TreeNode = { ...c, children: [] }
    byId.set(c.id, node)
  }

  for (const c of flat) {
    const node = byId.get(c.id)!
    if (c.parentId) {
      byId.get(c.parentId)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortNodes = (arr: TreeNode[]) => {
    arr.sort((a,b)=> (a.sort - b.sort) || a.name.localeCompare(b.name))
    arr.forEach(n => sortNodes(n.children))
  }
  sortNodes(roots)

  // фильтрация по поиску — показываем ветви, где встречается запрос
  if (q) {
    function match(node: TreeNode): boolean {
      const here = node.name.toLowerCase().includes(q) || node.slug.toLowerCase().includes(q)
      const childMatch = node.children.some(match)
      node.isVisible = node.isVisible // no-op just to touch type
      return here || childMatch
    }
    const filtered: TreeNode[] = []
    for (const r of roots) if (match(r)) filtered.push(r)
    return filtered
  }

  return roots
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    flat: [] as Category[],
    search: '',
    expanded: new Set<string>() as Set<string>,
    selectedId: null as string | null,
    loading: false,
  }),
  getters: {
    tree(state): TreeNode[] {
      return buildTree(state.flat, state.search)
    },
    selected(state): Category | null {
      return state.flat.find(c => c.id === state.selectedId) || null
    }
  },
  actions: {
    async fetch() {
      this.loading = true
      try {
        this.flat = await listCategories()
        if (!this.selectedId && this.flat.length) this.selectedId = this.flat[0].id
      } finally {
        this.loading = false
      }
    },
    load() { return (this as any).fetch?.() },
    setSearch(q: string) { this.search = q },
    setSelected(id: string | null) { this.selectedId = id },
    toggleExpand(id: string) {
      if (this.expanded.has(id)) this.expanded.delete(id); else this.expanded.add(id)
    },
    expandAll() {
      this.expanded = new Set(this.flat.map(c => c.id))
    },
    collapseAll() {
      this.expanded = new Set()
    },
    async createRoot() {
      const item = await createCategory({ name: 'Новая категория', parentId: null, isVisible: true })
      await this.fetch()
      this.selectedId = item.id
      this.expanded.add(item.id)
    },
    async createChild(parentId: string) {
      const item = await createCategory({ name: 'Новая подкатегория', parentId, isVisible: true })
      await this.fetch()
      this.selectedId = item.id
      this.expanded.add(parentId)
    },
    async saveCategory(id: string, patch: Partial<Category>) {
      await updateCategory(id, patch)
      await this.fetch()
      this.selectedId = id
    },
    async removeCategory(id: string) {
      await deleteCategory(id)
      await this.fetch()
      if (!this.selectedId || !this.flat.find(c => c.id === this.selectedId)) {
        this.selectedId = this.flat[0]?.id || null
      }
    },
    async move(payload: { id: string; newParentId: string | null; newIndex?: number }) {
      await moveCategory(payload)
      await this.fetch()
      if (payload.newParentId) this.expanded.add(payload.newParentId)
    },
    slugify,
  }
})

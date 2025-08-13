// src/stores/categoryRules.ts
import { defineStore } from 'pinia'
import type { ID } from '@/types/Category'
import { listRules, createRule, updateRule, deleteRule, previewRule, applyRule, type CategoryRule } from '@/api/categoryRules'

export const useCategoryRulesStore = defineStore('categoryRules', {
  state: () => ({
    items: [] as CategoryRule[],
    loading: false,
    preview: { total: 0, ids: [] as ID[] }
  }),
  actions: {
    async fetch(categoryId?: ID) {
      this.loading = true
      try { this.items = await listRules(categoryId) } finally { this.loading = false }
    },
    async add(categoryId: ID, query: string) {
      await createRule({ categoryId, query })
      await this.fetch(categoryId)
    },
    async patch(id: ID, patch: Partial<CategoryRule>, categoryId?: ID) {
      await updateRule(id, patch)
      await this.fetch(categoryId)
    },
    async remove(id: ID, categoryId?: ID) {
      await deleteRule(id)
      await this.fetch(categoryId)
    },
    async doPreview(query: string) {
      this.preview = await previewRule(query)
    },
    async doApply(ruleId: ID) {
      return await applyRule(ruleId)
    }
  }
})

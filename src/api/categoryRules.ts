// src/api/categoryRules.ts
// ✅ Безопасная версия: не требует никакого `allProducts` из products.ts
// Следуем принципу "не менять существующие API": используем только listProducts + bulkAssignCategory.

import type { ID } from '@/types/Category'
import type { Product } from '@/types/Product'
import { bulkAssignCategory, listProducts } from '@/api/products'

export interface CategoryRule {
  id: ID
  categoryId: ID
  priority: number
  enabled: boolean
  query: string
  createdAt: string
  updatedAt: string
}

const KEY = '__mock_category_rules_v1__'

function nowISO(){ return new Date().toISOString() }

function load(): CategoryRule[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as CategoryRule[]
  } catch { return [] }
}
function save(list: CategoryRule[]) { localStorage.setItem(KEY, JSON.stringify(list)) }

export async function listRules(categoryId?: ID): Promise<CategoryRule[]> {
  const arr = load().sort((a,b)=> (b.enabled?1:0)-(a.enabled?1:0) || a.priority - b.priority)
  return categoryId ? arr.filter(r => r.categoryId === categoryId) : arr
}

export async function createRule(input: { categoryId: ID; query: string; priority?: number; enabled?: boolean }): Promise<CategoryRule> {
  const list = load()
  const id = 'r' + Math.random().toString(36).slice(2,9)
  const item: CategoryRule = {
    id,
    categoryId: input.categoryId,
    priority: input.priority ?? (Math.max(0, ...list.filter(r => r.categoryId === input.categoryId).map(r => r.priority)) + 1),
    enabled: input.enabled ?? true,
    query: (input.query || '').trim(),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  list.push(item); save(list); return item
}

export async function updateRule(id: ID, patch: Partial<CategoryRule>): Promise<CategoryRule> {
  const list = load()
  const idx = list.findIndex(r => r.id === id)
  if (idx === -1) throw new Error('Rule not found')
  list[idx] = { ...list[idx], ...patch, updatedAt: nowISO() }
  save(list)
  return list[idx]
}

export async function deleteRule(id: ID): Promise<void> {
  const next = load().filter(r => r.id !== id)
  save(next)
}

export interface PreviewResult { total: number; ids: ID[] }

// 🔎 Универсальная подгрузка всех товаров без расширения API
async function loadAllProducts(max = 100000): Promise<Product[]> {
  try {
    // Попытка 1: сигнатура list(page, pageSize, filter, sort)
    const anyRes: any = await (listProducts as any)(1, max, {}, { by: 'updatedAt', dir: 'desc', stockByKeys: [] })
    if (Array.isArray(anyRes)) return anyRes as Product[]
    if (anyRes && Array.isArray(anyRes.items)) return anyRes.items as Product[]
  } catch {}
  try {
    // Попытка 2: постранично по 1000
    const acc: Product[] = []
    let page = 1; const size = 1000
    while (acc.length < max) {
      const anyRes: any = await (listProducts as any)(page, size, {})
      const items: Product[] = Array.isArray(anyRes) ? anyRes : (anyRes?.items || [])
      if (!items.length) break
      acc.push(...items)
      // если total есть — выйдем, когда набрали всё
      const total = (anyRes && typeof anyRes.total === 'number') ? anyRes.total : undefined
      if (total != null && acc.length >= total) break
      page++
    }
    return acc
  } catch {
    return []
  }
}

export async function previewRule(query: string, limit = 100): Promise<PreviewResult> {
  const items = await loadAllProducts()
  const matched = items.filter(p => matchQuery(p, query))
  return { total: matched.length, ids: matched.slice(0, limit).map(p => p.id) }
}

export async function applyRule(ruleId: ID): Promise<{ affected: number }> {
  const rules = load()
  const r = rules.find(x => x.id === ruleId)
  if (!r) throw new Error('Rule not found')
  const items = await loadAllProducts()
  const ids = items.filter(p => matchQuery(p, r.query)).map(p => p.id)
  if (ids.length) await bulkAssignCategory(ids, r.categoryId)
  return { affected: ids.length }
}

// ---- примитивный парсер запроса ----
// Поддержка: brand:xxx, status:active|draft|archived, has:doc, sku:123, article:XYZ,
// price>=N, price<=N, title:"строка", просто слова → поиск по name/sku/article
export function matchQuery(p: Product, q: string): boolean {
  if (!q || !q.trim()) return false
  const tokens = tokenize(q.trim())
  let ok = true
  for (const t of tokens) {
    if (t.type === 'word') {
      const v = t.value.toLowerCase()
      const hit = (p.name?.toLowerCase().includes(v) || p.sku?.toLowerCase().includes(v) || p.article?.toLowerCase().includes(v))
      ok = ok && (t.neg ? !hit : hit)
    } else if (t.type === 'kv') {
      const key = t.key
      const val = t.value.toLowerCase()
      let hit = false
      if (key === 'brand')       hit = (p as any).brand ? String((p as any).brand).toLowerCase() === val : false
      else if (key === 'status') hit = (p.status || '').toLowerCase() === val
      else if (key === 'sku')    hit = (p.sku || '').toLowerCase().includes(val)
      else if (key === 'article')hit = (p.article || '').toLowerCase().includes(val)
      else if (key === 'has')    hit = (val.startsWith('doc')) ? !!(p.documents && p.documents.length) : (val.startsWith('photo') || val.startsWith('img')) ? !!(p as any).images?.length : false
      else if (key === 'title')  hit = (p.name || '').toLowerCase().includes(val)
      ok = ok && (t.neg ? !hit : hit)
    } else if (t.type === 'cmp') {
      const prop = t.key === 'price' ? (p.price || 0) : 0
      if (t.op === '>=') ok = ok && (prop >= t.value)
      if (t.op === '<=') ok = ok && (prop <= t.value)
      if (t.op === '>')  ok = ok && (prop >  t.value)
      if (t.op === '<')  ok = ok && (prop <  t.value)
      if (t.op === '=')  ok = ok && (prop === t.value)
    }
    if (!ok) return false
  }
  return ok
}

type Token =
  | { type: 'word'; value: string; neg?: boolean }
  | { type: 'kv'; key: string; value: string; neg?: boolean }
  | { type: 'cmp'; key: 'price'; op: '>='|'<='|'>'|'<'|'='; value: number; neg?: boolean }

function tokenize(s: string): Token[] {
  const out: Token[] = []
  const re = /(-)?(?:"([^"]+)"|'([^']+)'|([\wа-яА-ЯёЁ.-]+))(?:\s*(:|>=|<=|=|>|<)\s*(?:"([^"]+)"|'([^']+)'|([\wа-яА-ЯёЁ.-]+)))?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(s))) {
    const neg = !!m[1]
    const left = (m[2] || m[3] || m[4] || '').trim()
    const op = m[5]
    const right = (m[6] || m[7] || m[8] || '').trim()
    if (!op) {
      out.push({ type: 'word', value: left, neg })
    } else if (op === ':' ) {
      out.push({ type: 'kv', key: left.toLowerCase(), value: right, neg })
    } else {
      const n = Number(right); if (!Number.isFinite(n)) continue
      out.push({ type: 'cmp', key: 'price', op: op as any, value: n, neg })
    }
  }
  return out
}

// src/api/categories.ts
import type { Category, CategoryInput, ID, CategoryMove } from '@/types/Category'

const KEY = '__mock_categories_v1__'

function nowISO() { return new Date().toISOString() }

function save(list: Category[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}
function load(): Category[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return seed()
  try { return JSON.parse(raw) as Category[] } catch { return seed() }
}

function seed(): Category[] {
  const cats: Category[] = []
  // примеры
  const roots = [
    { name: 'Запчасти' },
    { name: 'Масла и жидкости' },
    { name: 'Инструменты' },
  ]
  let id = 1
  for (const r of roots) {
    const rid = 'c' + id++
    cats.push({
      id: rid,
      name: r.name,
      slug: slugify(r.name),
      parentId: null,
      sort: id,
      isVisible: true,
      productCount: Math.floor(Math.random()*120),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    })
    for (let j=1;j<=3;j++) {
      const cid = 'c' + id++
      const nm = r.name + ' / Подкатегория ' + j
      cats.push({
        id: cid,
        name: nm,
        slug: slugify(nm),
        parentId: rid,
        sort: j,
        isVisible: true,
        productCount: Math.floor(Math.random()*40),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      })
    }
  }
  save(cats)
  return cats
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    // простая транслитерация для часто встречающихся русских букв
    .replace(/ё/g,'e')
    .replace(/[й]/g,'i')
    .replace(/[ч]/g,'ch').replace(/[ш]/g,'sh').replace(/[щ]/g,'sch')
    .replace(/[ю]/g,'yu').replace(/[я]/g,'ya')
    .replace(/[ж]/g,'zh').replace(/[х]/g,'h')
    .replace(/[ц]/g,'c')
    .replace(/[ъь]/g,'')
    .replace(/[а]/g,'a').replace(/[б]/g,'b').replace(/[в]/g,'v').replace(/[г]/g,'g').replace(/[д]/g,'d').replace(/[еэ]/g,'e').replace(/[з]/g,'z')
    .replace(/[и]/g,'i').replace(/[й]/g,'i').replace(/[к]/g,'k').replace(/[л]/g,'l').replace(/[м]/g,'m').replace(/[н]/g,'n').replace(/[о]/g,'o').replace(/[п]/g,'p').replace(/[р]/g,'r').replace(/[с]/g,'s').replace(/[т]/g,'t').replace(/[у]/g,'u').replace(/[ф]/g,'f').replace(/[ы]/g,'y')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
}

export async function listCategories(): Promise<Category[]> {
  // возвращаем плоский список
  return load().slice().sort((a,b) => {
    if (a.parentId === b.parentId) return a.sort - b.sort || a.name.localeCompare(b.name)
    return (a.parentId||'').localeCompare(b.parentId||'') || a.sort - b.sort
  })
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const list = load()
  const id = 'c' + Math.random().toString(36).slice(2,9)
  const parentId = input.parentId
  const siblings = list.filter(c => c.parentId === parentId)
  const sort = siblings.length ? Math.max(...siblings.map(s => s.sort)) + 1 : 1
  const item: Category = {
    id,
    name: input.name,
    slug: input.slug || slugify(input.name),
    parentId,
    sort,
    isVisible: input.isVisible ?? true,
    productCount: 0,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  list.push(item)
  save(list)
  return item
}

export async function updateCategory(id: ID, patch: Partial<Category>): Promise<Category> {
  const list = load()
  const idx = list.findIndex(c => c.id === id)
  if (idx === -1) throw new Error('Category not found')
  list[idx] = { ...list[idx], ...patch, updatedAt: nowISO() }
  // если сменился parentId — отправляем в конец группы
  if (patch.parentId !== undefined) {
    const siblings = list.filter(c => c.parentId === list[idx].parentId && c.id !== id)
    const max = siblings.length ? Math.max(...siblings.map(s => s.sort)) : 0
    list[idx].sort = max + 1
  }
  save(list)
  return list[idx]
}

export async function deleteCategory(id: ID): Promise<void> {
  const list = load()
  // удаляем рекурсивно всех потомков
  const toDelete = new Set<string>()
  function collect(target: ID) {
    toDelete.add(target as string)
    list.filter(c => c.parentId === target).forEach(c => collect(c.id))
  }
  collect(id)
  const next = list.filter(c => !toDelete.has(c.id))
  save(next)
}

export async function moveCategory(move: CategoryMove): Promise<void> {
  const list = load()
  const idx = list.findIndex(c => c.id === move.id)
  if (idx === -1) throw new Error('Category not found')
  const item = list[idx]
  const oldParent = item.parentId
  item.parentId = move.newParentId
  item.updatedAt = nowISO()

  // нормализуем sort у всех sibling’ов старого и нового родителя
  function normalize(parentId: ID | null) {
    const siblings = list.filter(c => c.parentId === parentId).sort((a,b)=>a.sort-b.sort)
    siblings.forEach((s, i) => s.sort = i + 1)
  }
  normalize(oldParent)
  normalize(move.newParentId)

  if (move.newIndex !== undefined) {
    const siblings = list.filter(c => c.parentId === move.newParentId).sort((a,b)=>a.sort-b.sort)
    const without = siblings.filter(s => s.id !== item.id)
    without.splice(move.newIndex, 0, item)
    without.forEach((s, i) => s.sort = i + 1)
  }

  save(list)
}

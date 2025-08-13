import { api } from '@/shared/api/client'

export type Category = {
  id: string
  name: string
  parentId?: string | null
  icon?: string | null
  position?: number
  createdAt?: string
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories')
  return data || []
}

export async function createCategory(partial: Partial<Category>) {
  const payload = {
    id: crypto.randomUUID(),
    name: partial.name || 'Новая категория',
    parentId: partial.parentId ?? null,
    icon: partial.icon ?? null,
    position: partial.position ?? Date.now(),
    createdAt: new Date().toISOString()
  }
  const { data } = await api.post('/categories', payload)
  return data
}

export async function updateCategory(id: string, patch: Partial<Category>) {
  const { data } = await api.patch('/categories/' + id, patch)
  return data
}

export async function deleteCategory(id: string) {
  await api.delete('/categories/' + id)
}

export function buildTree(items: Category[]) {
  const byId: Record<string, any> = {}
  items.forEach(i => byId[i.id] = { ...i, children: [] })
  const roots: any[] = []
  for (const it of Object.values(byId)) {
    if (it.parentId && byId[it.parentId]) byId[it.parentId].children.push(it)
    else roots.push(it)
  }
  const sortRec = (arr:any[]) => { arr.sort((a,b)=> (a.position||0)-(b.position||0) || a.name.localeCompare(b.name)); arr.forEach(n=> sortRec(n.children)) }
  sortRec(roots)
  return { roots, byId }
}

export function depthOf(nodeId: string, byId: Record<string, any>) {
  let d=1; let cur = byId[nodeId]; 
  while (cur && cur.parentId) { d++; cur = byId[cur.parentId] }
  return d
}

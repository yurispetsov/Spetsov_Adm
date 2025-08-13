// src/api/products.ts (DnD/Batch/Edit ready)
export type ID = string

export interface StockByStore { [storeId: string]: number }

export interface AttrKV { name: string; value: string }
export interface MetricNVU { name: string; value: number; unit: string }
export interface DocLink { name: string; url: string }

export interface Product {
  id: ID
  sku: string
  article?: string
  name: string
  price: number
  stock: StockByStore
  categoryId?: string | null
  active: boolean
  updatedAt: string

  // extra fields for editor
  description?: string
  attributes?: AttrKV[]
  metrics?: MetricNVU[]
  documents?: DocLink[]
}

const KEY = '__mock_products_v2__'

function makeId(): ID {
  try { return (globalThis as any).crypto?.randomUUID?.() as string } catch {}
  return 'p' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}
const now = () => new Date().toISOString()

function read(): Product[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const seed = seedProducts()
    localStorage.setItem(KEY, JSON.stringify(seed))
    return seed
  }
  try { return JSON.parse(raw) as Product[] } catch { return [] }
}
function write(arr: Product[]){ localStorage.setItem(KEY, JSON.stringify(arr)) }

function seedProducts(): Product[] {
  const cats = ['c1','c5','c9']
  const items: Product[] = []
  for (let i=1;i<=36;i++){
    const cat = cats[i % cats.length]
    items.push({
      id: makeId(),
      sku: `SKU-${1000+i}`,
      article: `ART-${i}`,
      name: `Товар ${i}`,
      price: Math.round(900 + i * 37.25),
      stock: { s1: (i*3)%12, s2: (i*5)%9 },
      categoryId: cat,
      active: i%9!==0,
      updatedAt: now(),
      description: 'Короткое описание товара ' + i,
      attributes: [{ name:'Цвет', value: i%2?'Чёрный':'Серый' }],
      metrics: [{ name:'Вес', value: 1+i%3, unit: 'кг' }],
      documents: [{ name:'Инструкция', url:'#' }],
    })
  }
  return items
}

export interface Query { q?: string, sort?: 'name'|'price'|'stock'|'updated'|'active' }
export function listProducts(q: Query = {}): Product[] {
  let arr = read()
  const v = (q.q||'').toLowerCase()
  if (v) arr = arr.filter(p => (p.sku+' '+(p.article||'')+' '+p.name).toLowerCase().includes(v))
  if (q.sort==='price') arr.sort((a,b)=>a.price-b.price)
  else if (q.sort==='stock') arr.sort((a,b)=>sumStock(a)-sumStock(b))
  else if (q.sort==='updated') arr.sort((a,b)=> new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime())
  else if (q.sort==='active') arr.sort((a,b)=> Number(b.active)-Number(a.active) )
  else arr.sort((a,b)=>a.name.localeCompare(b.name))
  return arr
}

export function listByCategory(categoryId?: string|null, q: Query = {}): Product[] {
  let arr = read()
  if (categoryId) arr = arr.filter(p => p.categoryId===categoryId)
  const v = (q.q||'').toLowerCase()
  if (v) arr = arr.filter(p => (p.sku+' '+(p.article||'')+' '+p.name).toLowerCase().includes(v))
  return arr
}

export function saveProduct(p: Partial<Product>): Product {
  const all = read()
  if (!p.id) {
    const item: Product = {
      id: makeId(),
      sku: p.sku || '',
      article: p.article || '',
      name: p.name || '',
      price: p.price || 0,
      stock: p.stock || { s1:0, s2:0 },
      categoryId: p.categoryId || null,
      active: p.active ?? true,
      updatedAt: now(),
      description: p.description || '',
      attributes: p.attributes || [],
      metrics: p.metrics || [],
      documents: p.documents || [],
    }
    all.push(item); write(all); return item
  } else {
    const i = all.findIndex(x=>x.id===p.id); if (i<0) throw new Error('Not found')
    const next: Product = { ...all[i], ...p, updatedAt: now() } as Product
    all[i] = next; write(all); return next
  }
}

export function deleteProduct(id: ID){ write(read().filter(p=>p.id!==id)) }
export function toggleActive(ids: ID[], flag: boolean){
  const all = read()
  ids.forEach(id => {
    const i = all.findIndex(x=>x.id===id)
    if (i>=0) all[i] = { ...all[i], active: flag, updatedAt: now() }
  })
  write(all)
}

export function moveProductsToCategory(ids: ID[], categoryId: string|null){
  const all = read()
  ids.forEach(id => {
    const i = all.findIndex(x=>x.id===id)
    if (i>=0) all[i] = { ...all[i], categoryId, updatedAt: now() }
  })
  write(all)
  // notify listeners (Inspector in categories)
  try { window.dispatchEvent(new CustomEvent('products-changed')) } catch {}
}

export function sumStock(p: Product){ return Object.values(p.stock||{}).reduce((a,b)=>a+(b||0),0) }

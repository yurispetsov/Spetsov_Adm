// src/api/orders.ts — full API (v2) with all exports used across UI
export type ID = string
export type DeliveryType = 'pickup' | 'delivery'
export type OrderStatus = 'new' | 'processing' | 'ready' | 'shipped' | 'completed' | 'cancelled'

export interface OrderItem {
  id: ID
  sku?: string
  article?: string
  name: string
  qty: number
  price: number
}

export interface OrderDoc {
  id: ID
  name: string
  url: string
  type?: string
}

export interface Order {
  id: ID
  number1c: string
  clientType: 'person' | 'legal'
  clientName: string
  clientPhone?: string
  clientEmail?: string
  sum: number
  delivery: { type: DeliveryType; storeId?: string; address?: string }
  shipmentAt?: string  // ISO
  status: OrderStatus
  pickupCode?: string
  items: OrderItem[]
  docs?: OrderDoc[]
  createdAt: string
  updatedAt: string
}

export interface StorePoint {
  id: string
  name: string
  address?: string
  phone?: string
}

const STORES: StorePoint[] = [
  { id: 's1', name: 'Магазин №1 (Ленинградка)', address: 'Москва, Ленинградский пр-т, 10' },
  { id: 's2', name: 'Магазин №2 (Тверская)', address: 'Москва, ул. Тверская, 15' },
]

export function listStores(): StorePoint[] { return STORES }
export function storeNameById(id?: string): string {
  const s = STORES.find(x => x.id === id)
  return s ? s.name : ''
}

const KEY = '__mock_orders_v1__'

function makeId(): ID {
  try { return (globalThis as any).crypto?.randomUUID?.() as string } catch {}
  return 'o' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36).slice(-6)
}
function nowISO(){ return new Date().toISOString() }
function total(items: OrderItem[]){ return (items||[]).reduce((s,i)=>s + (Number(i.qty)||0)*(Number(i.price)||0), 0) }
export function regeneratePickupCode(): string { return 'P-' + Math.floor(100000 + Math.random()*900000) }

function seed(): Order[] {
  const itemsA: OrderItem[] = [
    { id: makeId(), sku:'SKU-1001', article:'ART-01', name:'Товар 1', qty:2, price:990 },
    { id: makeId(), sku:'SKU-1010', article:'ART-02', name:'Товар 2', qty:1, price:1490 },
  ]
  const itemsB: OrderItem[] = [
    { id: makeId(), sku:'SKU-2001', article:'A-15', name:'Пила цепная', qty:1, price:5990 },
    { id: makeId(), sku:'SKU-2002', article:'A-16', name:'Масло', qty:3, price:450 },
  ]

  const a: Order = {
    id: makeId(),
    number1c: '1C-000001',
    clientType: 'person',
    clientName: 'Иванов Иван',
    clientPhone: '+7 900 111-22-33',
    sum: total(itemsA),
    delivery: { type:'pickup', storeId: 's1' },
    shipmentAt: new Date(Date.now()+24*3600*1000).toISOString(),
    status: 'processing',
    pickupCode: regeneratePickupCode(),
    items: itemsA,
    docs: [{ id: makeId(), name: 'Счет', url: '#', type: 'invoice' }],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }

  const b: Order = {
    id: makeId(),
    number1c: '1C-000002',
    clientType: 'legal',
    clientName: 'ООО Ромашка',
    clientPhone: '+7 495 123-45-67',
    clientEmail: 'info@romashka.ru',
    sum: total(itemsB),
    delivery: { type:'delivery', address: 'Москва, ул. Пушкина, д. 5' },
    shipmentAt: new Date(Date.now()+2*24*3600*1000).toISOString(),
    status: 'new',
    pickupCode: undefined,
    items: itemsB,
    docs: [{ id: makeId(), name: 'Счет', url:'#', type:'invoice' }, { id: makeId(), name:'Счет-фактура', url:'#', type:'bill' }],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }

  const c: Order = {
    id: makeId(),
    number1c: '1C-000003',
    clientType: 'person',
    clientName: 'Петров Сергей',
    clientPhone: '+7 999 111-22-33',
    clientEmail: 'serg@example.com',
    sum: 2790,
    delivery: { type:'pickup', storeId: 's2' },
    shipmentAt: new Date(Date.now()+3*24*3600*1000).toISOString(),
    status: 'ready',
    pickupCode: regeneratePickupCode(),
    items: [
      { id: makeId(), name:'Фильтр', qty:1, price:1290 },
      { id: makeId(), name:'Свеча зажигания', qty:2, price:750 },
    ],
    docs: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }

  return [a,b,c]
}

function load(): Order[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) { const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s }
    return JSON.parse(raw) as Order[]
  } catch { const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s }
}

function save(list: Order[]){ localStorage.setItem(KEY, JSON.stringify(list)) }

export interface ListQuery {
  q?: string
  status?: OrderStatus | 'all'
  delivery?: DeliveryType | 'all'
  dateFrom?: string // ISO
  dateTo?: string   // ISO
  page?: number
  pageSize?: number
}

export interface ListResponse {
  items: Order[]
  total: number
  page: number
  pageSize: number
}

export async function listOrders(query: ListQuery = {}): Promise<ListResponse> {
  const { q='', status='all', delivery='all', dateFrom, dateTo } = query
  const all = load()
  let arr = all.slice()

  if (q) {
    const v = q.toLowerCase()
    arr = arr.filter(o => 
      o.number1c.toLowerCase().includes(v) ||
      o.clientName.toLowerCase().includes(v) ||
      (o.items||[]).some(i => (i.name||'').toLowerCase().includes(v) || (i.sku||'').toLowerCase().includes(v) || (i.article||'').toLowerCase().includes(v))
    )
  }
  if (status !== 'all') arr = arr.filter(o => o.status === status)
  if (delivery !== 'all') arr = arr.filter(o => o.delivery.type === delivery)
  if (dateFrom) arr = arr.filter(o => o.shipmentAt ? o.shipmentAt >= dateFrom : true)
  if (dateTo) arr = arr.filter(o => o.shipmentAt ? o.shipmentAt <= dateTo : true)

  // сортировка по дате отгрузки, затем по номеру
  arr.sort((a,b)=> String(a.shipmentAt||'').localeCompare(String(b.shipmentAt||'')) || a.number1c.localeCompare(b.number1c))

  const page = query.page || 1, pageSize = query.pageSize || 20
  const start = (page-1)*pageSize
  const items = arr.slice(start, start+pageSize)
  return { items, total: arr.length, page, pageSize }
}

export async function getOrder(id: ID): Promise<Order | null> {
  return load().find(o => o.id === id) || null
}

export async function updateOrder(id: ID, patch: Partial<Order>): Promise<Order> {
  const all = load()
  const i = all.findIndex(o => o.id === id)
  if (i === -1) throw new Error('Order not found')
  const prev = all[i]
  const next: Order = { ...prev, ...patch }
  // если менялись items — пересчёт суммы
  if (patch.items) next.sum = total(patch.items)
  // если менялся тип доставки — чистим противоположные поля
  if (patch.delivery) {
    const d = patch.delivery
    if (d.type === 'pickup') next.delivery = { type:'pickup', storeId: d.storeId || prev.delivery.storeId }
    else next.delivery = { type:'delivery', address: d.address || prev.delivery.address }
  }
  next.updatedAt = nowISO()
  all[i] = next
  save(all); return next
}

export async function deleteOrder(id: ID): Promise<void> {
  const next = load().filter(o => o.id !== id)
  save(next)
}

export async function setOrderStatus(id: ID, status: OrderStatus): Promise<Order> {
  return updateOrder(id, { status })
}

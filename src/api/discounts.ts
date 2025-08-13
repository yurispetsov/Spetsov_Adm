// src/api/discounts.ts (updated seeds + optional priority and cleaner save)
import type { DeliveryType } from '@/api/orders'

export type ID = string

export type PaymentMethod = 'cash'|'card'|'online'|'invoice'
export interface PriceType {
  id: ID
  key: string
  name: string
  description?: string
  priority?: number         // optional (kept for backward compatibility)
  active: boolean
  markupPercent?: number
  discountPercent?: number
  createdAt: string
  updatedAt: string
}

export type DiscountKind = 'percent'|'amount'|'free_shipping'
export interface BaseRule {
  active: boolean
  validFrom?: string
  validTo?: string
  clientIds?: string[]
  groupKeys?: string[]
  payment?: PaymentMethod | 'all'
  delivery?: DeliveryType | 'all'
}
export interface Discount extends BaseRule {
  id: ID
  name: string
  kind: DiscountKind
  value?: number
  priceTypeKey?: string
  createdAt: string
  updatedAt: string
}
export interface PromoCode extends BaseRule {
  id: ID
  code: string
  name?: string
  kind: DiscountKind
  value?: number
  priceTypeKey?: string
  usesLimit?: number
  usedCount: number
  createdAt: string
  updatedAt: string
}

const K_PRICE = '__price_types_v1__'
const K_DISC  = '__discounts_v1__'
const K_PROMO = '__promos_v1__'

function makeId(): ID {
  try { return (globalThis as any).crypto?.randomUUID?.() as string } catch {}
  return 'd' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36).slice(-6)
}
const now = () => new Date().toISOString()

function read<T>(key: string): T[] {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  try { return JSON.parse(raw) as T[] } catch { return [] }
}
function write<T>(key: string, arr: T[]) { localStorage.setItem(key, JSON.stringify(arr)) }

// ---- Price Types ----
export function listPriceTypes(): PriceType[] {
  const items = read<PriceType>(K_PRICE)
  if (!items.length) {
    const seed: PriceType[] = [
      { id: makeId(), key:'purchase',   name:'Закупочная',          active:true, createdAt: now(), updatedAt: now() },
      { id: makeId(), key:'retail',     name:'Розничная',           active:true, createdAt: now(), updatedAt: now() },
      { id: makeId(), key:'wholesale1', name:'Опт‑1',               active:true, discountPercent: 3, createdAt: now(), updatedAt: now() },
      { id: makeId(), key:'wholesale2', name:'Опт‑2',               active:true, discountPercent: 7, createdAt: now(), updatedAt: now() },
      { id: makeId(), key:'wholesale3', name:'Опт‑3',               active:true, discountPercent: 12, createdAt: now(), updatedAt: now() },
      { id: makeId(), key:'staff',      name:'Цена для сотрудников',active:true, discountPercent: 15, createdAt: now(), updatedAt: now() },
    ]
    write(K_PRICE, seed); return seed
  }
  return items
}
export function savePriceType(pt: Partial<PriceType>): PriceType {
  const all = listPriceTypes()
  if (!pt.id) {
    const item: PriceType = {
      id: makeId(), key: pt.key || '', name: pt.name || '', description: pt.description || '',
      priority: pt.priority, active: pt.active ?? true,
      markupPercent: pt.markupPercent, discountPercent: pt.discountPercent,
      createdAt: now(), updatedAt: now()
    }
    all.push(item); write(K_PRICE, all); return item
  } else {
    const i = all.findIndex(x => x.id === pt.id); if (i < 0) throw new Error('Not found')
    const next = { ...all[i], ...pt, updatedAt: now() } as PriceType
    all[i] = next; write(K_PRICE, all); return next
  }
}
export function deletePriceType(id: ID){ write(K_PRICE, listPriceTypes().filter(x => x.id !== id)) }

// ---- Discounts ----
export type DiscountKind = 'percent'|'amount'|'free_shipping'
export function listDiscounts(): Discount[] {
  const items = read<Discount>(K_DISC)
  if (!items.length) {
    const seed: Discount[] = [
      { id: makeId(), name:'-5% для самовывоза', kind:'percent', value:5, delivery:'pickup', payment:'all', active:true, createdAt:now(), updatedAt:now() },
      { id: makeId(), name:'-300 ₽ онлайн-оплата', kind:'amount', value:300, payment:'online', delivery:'all', active:true, createdAt:now(), updatedAt:now() },
    ]
    write(K_DISC, seed); return seed
  }
  return items
}
export function saveDiscount(d: Partial<Discount>): Discount {
  const all = listDiscounts()
  if (!d.id) {
    const item: Discount = {
      id: makeId(), name: d.name || '', kind: d.kind || 'percent', value: d.value ?? undefined,
      priceTypeKey: d.priceTypeKey, active: d.active ?? true, validFrom: d.validFrom, validTo: d.validTo,
      clientIds: d.clientIds || [], groupKeys: d.groupKeys || [], payment: d.payment || 'all', delivery: d.delivery || 'all',
      createdAt: now(), updatedAt: now()
    }
    all.unshift(item); write(K_DISC, all); return item
  } else {
    const i = all.findIndex(x => x.id === d.id); if (i < 0) throw new Error('Not found')
    const next = { ...all[i], ...d, updatedAt: now() } as Discount
    all[i] = next; write(K_DISC, all); return next
  }
}
export function deleteDiscount(id: ID){ write(K_DISC, listDiscounts().filter(x => x.id !== id)) }

// ---- Promo codes ----
export interface PromoCode extends BaseRule {
  id: ID
  code: string
  name?: string
  kind: DiscountKind
  value?: number
  priceTypeKey?: string
  usesLimit?: number
  usedCount: number
  createdAt: string
  updatedAt: string
}
export function listPromos(): any[] {
  const items = read<PromoCode>(K_PROMO)
  if (!items.length) {
    const seed: PromoCode[] = [
      { id: makeId(), code:'WELCOME10', name:'Welcome -10%', kind:'percent', value:10, usedCount:0, active:true, payment:'all', delivery:'all', createdAt:now(), updatedAt:now() },
      { id: makeId(), code:'FREESHIP', name:'Бесплатная доставка', kind:'free_shipping', usedCount:0, active:true, payment:'online', delivery:'delivery', createdAt:now(), updatedAt:now() },
    ]
    write(K_PROMO, seed); return seed
  }
  return items
}
export function savePromo(p: Partial<PromoCode>): PromoCode {
  const all = listPromos() as PromoCode[]
  if (!p.id) {
    if (!p.code) throw new Error('Code is required')
    if (all.some(x => x.code.toLowerCase() === p.code!.toLowerCase())) throw new Error('Code already exists')
    const item: PromoCode = {
      id: makeId(), code: p.code!, name: p.name || '', kind: p.kind || 'percent', value: p.value ?? undefined,
      priceTypeKey: p.priceTypeKey, usesLimit: p.usesLimit, usedCount: 0, active: p.active ?? true,
      validFrom: p.validFrom, validTo: p.validTo, clientIds: p.clientIds || [], groupKeys: p.groupKeys || [],
      payment: p.payment || 'all', delivery: p.delivery || 'all',
      createdAt: now(), updatedAt: now()
    }
    all.unshift(item); write(K_PROMO, all); return item
  } else {
    const i = all.findIndex(x => x.id === p.id); if (i < 0) throw new Error('Not found')
    const next = { ...all[i], ...p, updatedAt: now() } as PromoCode
    all[i] = next; write(K_PROMO, all); return next
  }
}
export function deletePromo(id: ID){ write(K_PROMO, listPromos().filter((x: any) => x.id !== id)) }

// ---- Aux ----
export function listPaymentMethods(): { key: PaymentMethod, name: string }[] {
  return [
    { key:'cash', name:'Наличные' },
    { key:'card', name:'Карта' },
    { key:'online', name:'Онлайн-оплата' },
    { key:'invoice', name:'Счёт (безнал)' },
  ]
}
export function discountKinds(): { key: DiscountKind, name: string }[] {
  return [
    { key:'percent', name:'Процент (-%)' },
    { key:'amount', name:'Фикс. сумма (-₽)' },
    { key:'free_shipping', name:'Бесплатная доставка' },
  ]
}

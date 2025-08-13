// src/stores/orders.ts
import { defineStore } from 'pinia'
import type { Order, ListQuery, OrderStatus, DeliveryType } from '@/api/orders'
import { listOrders, getOrder, setOrderStatus, updateOrder } from '@/api/orders'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    items: [] as Order[],
    total: 0,
    page: 1,
    pageSize: 20,
    q: '',
    status: 'all' as OrderStatus | 'all',
    delivery: 'all' as DeliveryType | 'all',
    dateFrom: '' as string,
    dateTo: '' as string,
    loading: false,
    current: null as Order | null,
  }),
  actions: {
    setQuery(q: string){ this.q = q; this.page = 1; this.fetch() },
    setStatus(s: OrderStatus | 'all'){ this.status = s; this.page = 1; this.fetch() },
    setDelivery(d: DeliveryType | 'all'){ this.delivery = d; this.page = 1; this.fetch() },
    setDateFrom(v: string){ this.dateFrom = v; this.page = 1; this.fetch() },
    setDateTo(v: string){ this.dateTo = v; this.page = 1; this.fetch() },
    setPage(p: number){ this.page = p; this.fetch() },
    async fetch(){
      this.loading = true
      try {
        const res = await listOrders({ q:this.q, status:this.status, delivery:this.delivery, dateFrom:this.dateFrom, dateTo:this.dateTo, page:this.page, pageSize:this.pageSize } as ListQuery)
        this.items = res.items; this.total = res.total
      } finally { this.loading = false }
    },
    async open(id: string){
      this.current = await getOrder(id)
    },
    async setStatusForCurrent(s: OrderStatus){
      if (!this.current) return
      this.current = await setOrderStatus(this.current.id, s)
      await this.fetch()
    },
    async setStatusFor(id: string, s: OrderStatus){
      await setOrderStatus(id, s); await this.fetch()
    },
    async saveCurrentPatch(patch: Partial<Order>){
      if (!this.current) return
      this.current = await updateOrder(this.current.id, patch)
      await this.fetch()
    }
  }
})

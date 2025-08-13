// src/stores/discounts.ts
import { defineStore } from 'pinia'
import type { Discount, PromoCode, PriceType } from '@/api/discounts'
import { listDiscounts, listPromos, listPriceTypes, saveDiscount, savePromo, savePriceType, deleteDiscount, deletePromo, deletePriceType } from '@/api/discounts'

export const useDiscountsStore = defineStore('discounts', {
  state: () => ({
    tab: 'promos' as 'promos'|'discounts'|'prices',
    promos: [] as PromoCode[],
    discounts: [] as Discount[],
    prices: [] as PriceType[],
    q: '',
    editing: null as any,
  }),
  getters: {
    filteredPromos(state){ const v = state.q.toLowerCase(); return !v ? state.promos : state.promos.filter(p => (p.code + ' ' + (p.name||'')).toLowerCase().includes(v)) },
    filteredDiscounts(state){ const v = state.q.toLowerCase(); return !v ? state.discounts : state.discounts.filter(d => (d.name||'').toLowerCase().includes(v)) },
    filteredPrices(state){ const v = state.q.toLowerCase(); return !v ? state.prices : state.prices.filter(p => (p.name+' '+p.key).toLowerCase().includes(v)) },
  },
  actions: {
    setTab(t: 'promos'|'discounts'|'prices'){ this.tab = t },
    setQuery(q: string){ this.q = q },
    fetchAll(){ this.promos = listPromos(); this.discounts = listDiscounts(); this.prices = listPriceTypes() },
    startEdit(x: any){ this.editing = JSON.parse(JSON.stringify(x||null)) },
    stopEdit(){ this.editing = null },
    async save(item: any){
      if (this.tab==='promos') this.promos = [savePromo(item), ...listPromos().filter(p => p.id !== item.id)]
      if (this.tab==='discounts') this.discounts = [saveDiscount(item), ...listDiscounts().filter(d => d.id !== item.id)]
      if (this.tab==='prices') this.prices = [savePriceType(item), ...listPriceTypes().filter(p => p.id !== item.id)]
      this.fetchAll(); this.stopEdit()
    },
    remove(id: string){
      if (this.tab==='promos') deletePromo(id)
      if (this.tab==='discounts') deleteDiscount(id)
      if (this.tab==='prices') deletePriceType(id)
      this.fetchAll()
    },
  }
})

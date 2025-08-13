import { defineStore } from 'pinia';
import { listOrders, getOrder, updateOrderStatus, type OrdersQuery } from '@/shared/api/orders';
import type { Order, OrderBrief, OrderStatus } from '@/types/order';

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    page: 1, perPage: 20,
    search: '',
    sort: 'updated' as OrdersQuery['sort'],
    status: 'all' as OrdersQuery['status'],
    delivery: 'all' as OrdersQuery['delivery'],
    total: 0,
    items: [] as OrderBrief[],
    current: null as Order | null,
    loading: false,
  }),
  actions: {
    async fetch() {
      this.loading = true;
      try {
        const { items, total, page, perPage } = await listOrders({
          page: this.page, perPage: this.perPage,
          search: this.search, sort: this.sort,
          status: this.status, delivery: this.delivery
        });
        this.items = items; this.total = total;
        this.page = page; this.perPage = perPage;
      } finally { this.loading = false; }
    },
    async open(id: string) {
      this.loading = true;
      try { this.current = await getOrder(id); }
      finally { this.loading = false; }
    },
    async setStatus(id: string, status: OrderStatus) {
      await updateOrderStatus(id, status);
      const row = this.items.find(x => x.id === id); if (row) row.status = status;
      if (this.current?.id === id) this.current.status = status;
    }
  }
});

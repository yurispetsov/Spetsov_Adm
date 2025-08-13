<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/shared/api/client'
const stats = ref<{ products:number; orders:number; customers:number; }|null>(null)
onMounted(async () => {
  try {
    const [p,o,c] = await Promise.all([api.get('/products'), api.get('/orders'), api.get('/customers')])
    stats.value = { products: (p.data||[]).length, orders: (o.data||[]).length, customers: (c.data||[]).length }
  } catch {}
})
</script>
<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-semibold">Дашборд</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card p-4"><div class="text-sm text-gray-500">Товары</div><div class="text-2xl font-semibold">{{ stats?.products ?? '—' }}</div></div>
      <div class="card p-4"><div class="text-sm text-gray-500">Заказы</div><div class="text-2xl font-semibold">{{ stats?.orders ?? '—' }}</div></div>
      <div class="card p-4"><div class="text-sm text-gray-500">Клиенты</div><div class="text-2xl font-semibold">{{ stats?.customers ?? '—' }}</div></div>
    </div>
  </div>
</template>

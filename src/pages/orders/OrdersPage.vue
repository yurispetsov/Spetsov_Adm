<!-- src/pages/orders/OrdersPage.vue -->
<template>
  <section class="p-6 h-[calc(100vh-88px)] flex flex-col">
    <header class="mb-3 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Заказы</h1>
      <div class="flex gap-2">
        <input v-model="q" placeholder="Поиск (№, клиент)" class="border rounded px-3 py-2 w-72">
        <select v-model="status" class="border rounded px-3 py-2">
          <option value="">Все статусы</option>
          <option value="new">Новый</option>
          <option value="paid">Оплачен</option>
          <option value="packed">Собран</option>
          <option value="shipped">Отгружен</option>
          <option value="done">Завершён</option>
          <option value="canceled">Отменён</option>
        </select>
      </div>
    </header>

    <OrdersTable :items="items" :page="page" :per-page="perPage" @details="openDetails" :total="total" @open="openDetails" class="flex-1" />

    <footer class="mt-3 flex items-center gap-3">
      <button class="border rounded px-2 py-1" :disabled="page<=1" @click="page--">Назад</button>
      <div class="text-sm">Стр. {{ page }} из {{ pages }}</div>
      <button class="border rounded px-2 py-1" :disabled="page>=pages" @click="page++">Вперёд</button>
      <div class="ml-auto text-sm opacity-70">Всего: {{ total }}</div>
    </footer>

    <OrderDetailsModal ref="refModal" />
  </section>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import OrdersTable from '@/components/orders/OrdersTable.vue'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue'
import { listOrders, type Order } from '@/api/orders'

const q = ref('')
const status = ref('')
const page = ref(1)
const perPage = ref(20)
const loading = ref(false)
const error   = ref<string | null>(null)

const items = ref<Order[]>([])
const total = ref(0)

async function load(){
  loading.value = true
  error.value = null
  try {
    const res = await listOrders({
      q: q.value, status: status.value,
      page: page.value, perPage: perPage.value,
      sort: 'created'
    })
    items.value = res.items
    total.value = res.total
  } catch (e) {
    error.value = 'Не удалось загрузить заказы'
    console.error(e)
  } finally {
    loading.value = false
  }
  const res = await listOrders({ q: q.value, status: status.value, page: page.value, perPage: perPage.value, sort: 'created' })
  items.value = res.items
  total.value = res.total
}
watch([q, status, page], () => { load() }, { immediate: true })

const pages = computed(()=> Math.max(1, Math.ceil(total.value / perPage.value)) )

const refModal = ref<InstanceType<typeof OrderDetailsModal> | null>(null)
function openDetails(id: string){ refModal.value?.open(id) }
</script>

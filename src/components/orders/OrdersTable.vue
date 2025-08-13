<!-- src/components/orders/OrdersTable.vue -->
<template>
  <div class="border rounded overflow-auto">
    <table class="w-full text-sm">
      <thead class="sticky top-0 bg-gray-50 border-b">
        <tr>
          <th class="p-2 text-left w-36">№ заказа</th>
          <th class="p-2 text-left">Клиент</th>
          <th class="p-2 text-left w-28">Тип</th>
          <th class="p-2 text-left w-40">Отгрузка</th>
          <th class="p-2 text-right w-28">Сумма</th>
          <th class="p-2 text-left w-32">Статус</th>
          <th class="p-2 text-right w-24"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in items" :key="o.id" class="border-b hover:bg-gray-50">
          <td class="p-2">{{ o.number }}</td>
          <td class="p-2">{{ o.customerName || '—' }}</td>
          <td class="p-2">
            <span v-if="o.deliveryType==='pickup'">Самовывоз</span>
            <span v-else>Доставка</span>
          </td>
          <tr v-for="row in items" :key="row.id" @click="emit('details', row.id)">
  <!-- или кнопка -->
  <!-- <button @click.stop="emit('details', row.id)">Открыть</button> -->
</tr>
          <td class="p-2">
            <template v-if="o.deliveryType==='pickup'">
              {{ storeName(o.pickupStoreId) }} — {{ dt(o.deliveryAt) }}
            </template>
            <template v-else>
              {{ dt(o.deliveryAt) }}
            </template>
          </td>
          <td class="p-2 text-right">{{ money(o.total) }}</td>
          <td class="p-2">
            <span :class="badgeClass(o.status)" class="px-2 py-0.5 rounded text-xs">{{ statusRu(o.status) }}</span>
          </td>
          <td class="p-2 text-right">
            <button class="underline text-xs" @click="$emit('open', o.id)">Открыть</button>
          </td>
        </tr>
        <tr v-if="!items.length">
          <td colspan="7" class="p-6 text-center opacity-70">Записей нет</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Order, OrderStatus } from '@/api/orders'

const props = defineProps<{ items: Order[] }>()
const emit = defineEmits<{
  (e: 'details', id: string): void
}>()

function money(v: number){ return new Intl.NumberFormat('ru-RU', { style:'currency', currency:'RUB', maximumFractionDigits:0 }).format(v || 0) }
function dt(iso?: string | null){ return iso ? new Date(iso).toLocaleString('ru-RU') : '—' }
function storeName(id?: string | null){ 
  if (!id) return '—'
  // плейсхолдер; позже подменим на справочник магазинов
  return id === 'spb-1' ? 'СПб — Магазин 1' : id
}
function statusRu(s: OrderStatus){
  return { new:'Новый', paid:'Оплачен', packed:'Собран', shipped:'Отгружен', done:'Завершён', canceled:'Отменён' }[s] || s
}
function badgeClass(s: OrderStatus){
  return {
    new:'bg-yellow-100 text-yellow-800',
    paid:'bg-blue-100 text-blue-800',
    packed:'bg-indigo-100 text-indigo-800',
    shipped:'bg-purple-100 text-purple-800',
    done:'bg-green-100 text-green-800',
    canceled:'bg-red-100 text-red-800',
  }[s] || 'bg-gray-100 text-gray-700'
}
</script>

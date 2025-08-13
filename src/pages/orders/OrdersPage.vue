<template>
  <section class="p-6 h-[calc(100vh-88px)] flex flex-col gap-3">
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Заказы</h1>
      <div class="flex gap-2">
        <input v-model="store.search" class="border rounded px-3 py-2 w-72" placeholder="Поиск (номер, клиент)" @keyup.enter="store.fetch()" />
        <select v-model="store.status" class="border rounded px-3 py-2">
          <option value="all">Все статусы</option>
          <option value="new">Новый</option><option value="processing">В работе</option>
          <option value="picking">Комплектация</option><option value="ready">Готов к выдаче</option>
          <option value="shipped">Отгружен</option><option value="done">Завершён</option>
          <option value="canceled">Отменён</option>
        </select>
        <select v-model="store.delivery" class="border rounded px-3 py-2">
          <option value="all">Все типы</option>
          <option value="pickup">Самовывоз</option>
          <option value="courier">Доставка</option>
        </select>
        <select v-model="store.sort" class="border rounded px-3 py-2">
          <option value="updated">По обновлению</option>
          <option value="total">По сумме</option>
          <option value="customer">По клиенту</option>
          <option value="status">По статусу</option>
        </select>
        <button class="border rounded px-3 py-2" @click="store.fetch()">Обновить</button>
      </div>
    </header>

    <div class="flex-1 border rounded overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 border-b">
          <tr>
            <th class="p-2 text-left w-32">№ 1С</th>
            <th class="p-2 text-left">Клиент</th>
            <th class="p-2 text-right w-28">Сумма</th>
            <th class="p-2 text-left w-28">Тип</th>
            <th class="p-2 text-left w-44">Отгрузка</th>
            <th class="p-2 text-left w-40">Магазин</th>
            <th class="p-2 text-left w-36">Статус</th>
            <th class="p-2 text-right w-24"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in store.items" :key="o.id" class="border-b hover:bg-gray-50">
            <td class="p-2"><button class="underline" @click="open(o.id)">{{ o.oneCNumber }}</button></td>
            <td class="p-2">{{ o.customerName }}</td>
            <td class="p-2 text-right">{{ money(o.total) }}</td>
            <td class="p-2">{{ o.delivery==='pickup' ? 'Самовывоз' : 'Доставка' }}</td>
            <td class="p-2">{{ o.shipAt ? dt(o.shipAt) : '—' }}</td>
            <td class="p-2">{{ o.delivery==='pickup' ? (o.pickupStoreId ?? '—') : '—' }}</td>
            <td class="p-2">
              <span :class="badge(o.status)">{{ nameStatus(o.status) }}</span>
            </td>
            <td class="p-2 text-right">
              <button class="text-xs underline" @click="open(o.id)">Открыть</button>
            </td>
          </tr>
          <tr v-if="!store.items.length"><td colspan="8" class="p-6 text-center opacity-70">Ничего не найдено</td></tr>
        </tbody>
      </table>
    </div>

    <OrderDetailsModal v-if="store.current" :order="store.current"
      @close="store.current=null"
      @set-status="(s)=>store.setStatus(store.current!.id, s)" />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useOrdersStore } from '@/stores/orders';
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue';
import type { OrderStatus } from '@/types/order';

const store = useOrdersStore();
onMounted(store.fetch);

function open(id: string) { store.open(id); }

function money(v: number){ return new Intl.NumberFormat('ru-RU', { style:'currency', currency:'RUB', maximumFractionDigits:0 }).format(v); }
function dt(iso: string){ return new Date(iso).toLocaleString('ru-RU'); }
function nameStatus(s: OrderStatus) {
  return ({new:'Новый',processing:'В работе',picking:'Комплектация',ready:'Готов',shipped:'Отгружен',done:'Завершён',canceled:'Отменён'} as const)[s];
}
function badge(s: OrderStatus){
  const base = 'px-2 py-0.5 rounded text-xs';
  const map: Record<OrderStatus,string> = {
    new:'bg-yellow-100 text-yellow-900', processing:'bg-blue-100 text-blue-900',
    picking:'bg-amber-100 text-amber-900', ready:'bg-green-100 text-green-900',
    shipped:'bg-indigo-100 text-indigo-900', done:'bg-emerald-100 text-emerald-900',
    canceled:'bg-red-100 text-red-900'
  };
  return `${base} ${map[s]}`;
}
</script>

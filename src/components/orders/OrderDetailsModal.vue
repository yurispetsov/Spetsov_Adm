<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-40" @keydown.esc="$emit('close')">
    <div class="bg-white w-[960px] max-h-[90vh] rounded shadow flex flex-col overflow-hidden">
      <header class="p-4 border-b flex items-center justify-between">
        <h2 class="text-lg font-semibold">Заказ № {{ order.oneCNumber }}</h2>
        <button class="text-gray-500" @click="$emit('close')">✕</button>
      </header>

      <div class="p-4 grid grid-cols-2 gap-4 overflow-auto">
        <div>
          <div class="text-sm text-gray-500">Клиент</div>
          <div>{{ order.customerName }}</div>
          <div class="mt-2 text-sm text-gray-500">Тип</div>
          <div>{{ order.delivery==='pickup' ? 'Самовывоз' : 'Доставка' }}</div>
          <div v-if="order.delivery==='pickup' && order.pickupStoreId" class="mt-2">
            <div class="text-sm text-gray-500">Магазин</div><div>{{ order.pickupStoreId }}</div>
          </div>
          <div class="mt-2 text-sm text-gray-500">Статус</div>
          <div class="flex gap-2 items-center">
            <select v-model="localStatus" class="border rounded px-2 py-1">
              <option value="new">Новый</option><option value="processing">В работе</option>
              <option value="picking">Комплектация</option><option value="ready">Готов</option>
              <option value="shipped">Отгружен</option><option value="done">Завершён</option>
              <option value="canceled">Отменён</option>
            </select>
            <button class="border rounded px-3 py-1" @click="$emit('set-status', localStatus)">Применить</button>
          </div>
          <div v-if="order.code" class="mt-2 text-sm"><span class="text-gray-500">Код получения:</span> <b>{{ order.code }}</b></div>
          <div v-if="order.shipAt" class="mt-2 text-sm"><span class="text-gray-500">Отгрузка:</span> {{ new Date(order.shipAt).toLocaleString('ru-RU') }}</div>
        </div>

        <div>
          <div class="text-sm text-gray-500 mb-1">Товары</div>
          <table class="w-full text-sm border">
            <thead class="bg-gray-50">
              <tr><th class="p-2 text-left">Наименование</th><th class="p-2 w-16">Кол-во</th><th class="p-2 text-right w-24">Цена</th></tr>
            </thead>
            <tbody>
              <tr v-for="it in order.items" :key="it.id" class="border-t">
                <td class="p-2">{{ it.name }}</td>
                <td class="p-2 text-center">{{ it.qty }}</td>
                <td class="p-2 text-right">{{ money(it.price) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="mt-2 text-right font-medium">Итого: {{ money(order.total) }}</div>
          <div class="mt-4 flex gap-2">
            <button class="border rounded px-3 py-1" @click="printPickList">Печать сборочного листа</button>
            <a v-for="d in order.docs" :key="d.id" class="underline text-sm" :href="d.url" target="_blank">{{ d.title }}</a>
          </div>
        </div>
      </div>

      <footer class="p-4 border-t text-right">
        <button class="border rounded px-3 py-1" @click="$emit('close')">Закрыть</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Order, OrderStatus } from '@/types/order';

const props = defineProps<{ order: Order }>();
defineEmits<{ (e:'close'):void; (e:'set-status', s: OrderStatus): void }>();

const localStatus = ref<OrderStatus>(props.order.status);
watch(() => props.order.status, s => localStatus.value = s);

function money(v: number){ return new Intl.NumberFormat('ru-RU', { style:'currency', currency:'RUB', maximumFractionDigits:0 }).format(v); }
function printPickList(){
  const html = `
  <html><head><title>Сборочный лист ${props.order.oneCNumber}</title>
  <style>body{font-family:system-ui,Segoe UI,Roboto,Arial;padding:24px}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:6px;text-align:left}
  h1{font-size:18px;margin:0 0 12px} .muted{color:#666}</style></head>
  <body>
    <h1>Сборочный лист № ${props.order.oneCNumber}</h1>
    <div class="muted">Клиент: ${props.order.customerName}</div>
    <div class="muted">Тип: ${props.order.delivery==='pickup' ? 'Самовывоз' : 'Доставка'}</div>
    ${props.order.code ? `<div class="muted">Код получения: ${props.order.code}</div>` : ''}
    <table><thead><tr><th>Наименование</th><th>Кол-во</th><th>Цена</th></tr></thead>
      <tbody>
        ${props.order.items.map(i=>`<tr><td>${i.name}</td><td>${i.qty}</td><td style="text-align:right">${i.price}</td></tr>`).join('')}
      </tbody>
    </table>
  </body></html>`;
  const w=window.open('','_blank'); if(!w) return;
  w.document.write(html); w.document.close(); w.focus(); w.print();
}
</script>

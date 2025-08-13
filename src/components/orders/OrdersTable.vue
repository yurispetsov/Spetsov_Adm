<template>
  <div class="flex flex-col h-full">
    <div class="p-3 border-b grid grid-cols-12 items-center gap-2">
      <input v-model="q" placeholder="Поиск (№ 1С, клиент, товар)" class="border rounded px-3 py-2 col-span-5" />
      <select v-model="status" class="border rounded px-3 py-2 col-span-2">
        <option value="all">Все статусы</option>
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <select v-model="delivery" class="border rounded px-3 py-2 col-span-2">
        <option value="all">Все способы</option>
        <option value="pickup">Самовывоз</option>
        <option value="delivery">Доставка</option>
      </select>
      <input v-model="from" type="date" class="border rounded px-3 py-2 col-span-1" />
      <input v-model="to" type="date" class="border rounded px-3 py-2 col-span-1" />
      <div class="text-right col-span-1">
        <button class="border rounded px-3 py-2" @click="$emit('refresh')">Обновить</button>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 border-b">
          <tr>
            <th class="p-2 text-left w-36">№ 1С</th>
            <th class="p-2 text-left">Клиент</th>
            <th class="p-2 text-right w-28">Сумма</th>
            <th class="p-2 text-left w-28">Доставка</th>
            <th class="p-2 text-left w-48">Отгрузка</th>
            <th class="p-2 text-left w-56">Пункт</th>
            <th class="p-2 text-left w-40">Статус</th>
            <th class="p-2 text-right w-32"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in items" :key="o.id" class="border-b hover:bg-gray-50">
            <td class="p-2 cursor-pointer" @click="$emit('open', o.id)">{{ o.number1c }}</td>
            <td class="p-2 cursor-pointer" @click="$emit('open', o.id)">
              <div class="font-medium truncate">{{ o.clientName }}</div>
              <div class="opacity-70">{{ o.clientType==='person' ? 'Физ. лицо' : 'Юр. лицо' }}</div>
            </td>
            <td class="p-2 text-right cursor-pointer" @click="$emit('open', o.id)">{{ money(o.sum) }}</td>
            <td class="p-2">{{ o.delivery.type==='pickup' ? 'Самовывоз' : 'Доставка' }}</td>
            <td class="p-2">{{ dateTime(o.shipmentAt) }}</td>
            <td class="p-2">
              <span v-if="o.delivery.type==='pickup'">{{ storeName(o.delivery.storeId) }}</span>
              <span v-else>{{ o.delivery.address }}</span>
            </td>
            <td class="p-2">
              <span :class="badgeClass(o.status)">{{ statusLabel(o.status) }}</span>
            </td>
            <td class="p-2 text-right">
              <select class="border rounded px-2 py-1 text-xs" :value="o.status" @change="$emit('set-status', { id:o.id, status: ($event.target as HTMLSelectElement).value })">
                <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="p-3 border-t flex justify-between items-center">
      <div class="text-sm opacity-70">Показано: {{ items.length }}</div>
      <div class="space-x-2">
        <button class="border rounded px-3 py-2" @click="$emit('export-csv')">Экспорт CSV</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Order } from '@/api/orders'
import { storeNameById } from '@/api/orders'

const props = defineProps<{ items: Order[] }>()
const emit = defineEmits(['set-filter','open','refresh','set-status','export-csv'])

const q = ref(''); const status = ref('all'); const delivery = ref('all'); const from = ref(''); const to = ref('')
watch([q,status,delivery,from,to], () => emit('set-filter', { q:q.value, status: status.value, delivery:delivery.value, dateFrom:from.value, dateTo:to.value }), { immediate: true })

function storeName(id?: string){ return storeNameById(id) }
function dateTime(iso?: string){ return iso ? new Date(iso).toLocaleString('ru-RU') : '—' }
function money(v: number){ return new Intl.NumberFormat('ru-RU', { style:'currency', currency:'RUB', maximumFractionDigits: 0 }).format(v || 0) }

const statuses = [
  { value: 'new', label:'Новый' },
  { value: 'processing', label:'В работе' },
  { value: 'ready', label:'Готов' },
  { value: 'shipped', label:'Отгружен' },
  { value: 'completed', label:'Завершен' },
  { value: 'cancelled', label:'Отменен' },
]

function statusLabel(s: string){ const m = statuses.find(x => x.value===s); return m?m.label:s }
function badgeClass(s: string){
  const base = 'px-2 py-1 rounded text-xs border'
  if (s==='new') return base+' bg-yellow-50 border-yellow-300 text-yellow-800'
  if (s==='processing') return base+' bg-blue-50 border-blue-300 text-blue-800'
  if (s==='ready') return base+' bg-green-50 border-green-300 text-green-800'
  if (s==='shipped') return base+' bg-indigo-50 border-indigo-300 text-indigo-800'
  if (s==='completed') return base+' bg-gray-100 border-gray-300 text-gray-700'
  if (s==='cancelled') return base+' bg-red-50 border-red-300 text-red-800'
  return base
}
</script>

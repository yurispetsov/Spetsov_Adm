<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '@/shared/api/client'

const status = ref('')
const payment = ref('')
const shipping = ref('')
const page = ref(1)
const limit = ref(20)

const items = ref<any[]>([])
const total = ref(0)
const selected = ref<string[]>([])

const timelineOpen = ref(false)
const timelineOrder = ref<any|null>(null)

const pages = computed(()=> Math.max(1, Math.ceil(total.value/limit.value)))

async function load(){
  const { data } = await api.get('/orders', { params: { status: status.value, paymentStatus: payment.value, shippingStatus: shipping.value, limit: limit.value, offset: (page.value-1)*limit.value } })
  items.value = data?.items || data || []
  total.value = data?.total ?? items.value.length
}
onMounted(load)
watch([status,payment,shipping,page], load)

function toggle(id:string){ const s = new Set(selected.value); s.has(id)?s.delete(id):s.add(id); selected.value=Array.from(s) }

async function bulkStatus(newStatus:string){
  await Promise.all(selected.value.map(id => api.patch('/orders/'+id, { status: newStatus })))
  selected.value = []
  await load()
}
function openTimeline(o:any){ timelineOrder.value = o; timelineOpen.value = true }
function exportCsv(){
  const header = 'number,customer,total,status,payment,shipping,createdAt\n'
  const lines = items.value.map(o=>[o.number,o.customer,o.total,o.status,o.paymentStatus,o.shippingStatus,o.createdAt].join(','))
  const blob = new Blob([header+lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='orders.csv'; a.click(); URL.revokeObjectURL(url)
}
function printList(){ window.print() }
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="flex flex-wrap gap-2">
      <label class="block"><div class="text-xs mb-1">Статус заказа</div>
        <select v-model="status" class="select">
          <option value="">— любой —</option>
          <option value="new">Новый</option>
          <option value="processing">В обработке</option>
          <option value="shipped">Отгружен</option>
          <option value="completed">Завершён</option>
          <option value="cancelled">Отменён</option>
        </select>
      </label>
      <label class="block"><div class="text-xs mb-1">Оплата</div>
        <select v-model="payment" class="select">
          <option value="">— любая —</option>
          <option value="paid">Оплачен</option>
          <option value="unpaid">Не оплачен</option>
          <option value="refunded">Возврат</option>
        </select>
      </label>
      <label class="block"><div class="text-xs mb-1">Доставка</div>
        <select v-model="shipping" class="select">
          <option value="">— любая —</option>
          <option value="pending">Ожидает</option>
          <option value="shipped">Отправлен</option>
          <option value="delivered">Доставлен</option>
        </select>
      </label>
      <div class="ml-auto flex gap-2">
        <button class="btn" @click="exportCsv">Экспорт CSV</button>
        <button class="btn" @click="printList">Печать</button>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button class="btn" :disabled="!selected.length" @click="bulkStatus('processing')">В обработку</button>
      <button class="btn" :disabled="!selected.length" @click="bulkStatus('shipped')">Отгрузить</button>
      <button class="btn" :disabled="!selected.length" @click="bulkStatus('completed')">Завершить</button>
      <button class="btn" :disabled="!selected.length" @click="bulkStatus('cancelled')">Отменить</button>
      <div class="text-sm text-gray-500" v-if="selected.length">Выбрано: {{ selected.length }}</div>
    </div>

    <div class="card divide-y">
      <div class="row head">
        <div class="cell w-8"></div>
        <div class="cell w-40">№</div>
        <div class="cell grow">Покупатель</div>
        <div class="cell w-36">Сумма</div>
        <div class="cell w-40">Статус</div>
        <div class="cell w-40">Оплата</div>
        <div class="cell w-40">Доставка</div>
        <div class="cell w-56">Создан</div>
        <div class="cell w-32"></div>
      </div>
      <div v-for="o in items" :key="o.id" class="row">
        <div class="cell w-8"><input type="checkbox" :checked="selected.includes(o.id)" @change="toggle(o.id)" /></div>
        <div class="cell w-40">{{ o.number }}</div>
        <div class="cell grow">{{ o.customer }}</div>
        <div class="cell w-36">{{ o.total }} ₽</div>
        <div class="cell w-40">{{ o.status }}</div>
        <div class="cell w-40">{{ o.paymentStatus }}</div>
        <div class="cell w-40">{{ o.shippingStatus }}</div>
        <div class="cell w-56">{{ new Date(o.createdAt).toLocaleString() }}</div>
        <div class="cell w-32"><button class="btn" @click="openTimeline(o)">Таймлайн</button></div>
      </div>
      <div v-if="!items.length" class="p-6 text-sm text-gray-500">Нет данных</div>
    </div>

    <div class="flex justify-between items-center">
      <div class="text-sm text-gray-500">Всего: {{ total }}</div>
      <div class="flex gap-1">
        <button class="btn" :disabled="page<=1" @click="page--">Назад</button>
        <div class="px-2 py-1 text-sm">стр. {{ page }} / {{ pages }}</div>
        <button class="btn" :disabled="page>=pages" @click="page++">Вперёд</button>
      </div>
    </div>

    <!-- Timeline modal -->
    <div v-if="timelineOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="timelineOpen=false"></div>
      <div class="absolute inset-0 p-4 grid place-items-center">
        <div class="w-full max-w-2xl rounded-xl bg-white shadow-xl border overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b">
            <div class="font-semibold">Таймлайн заказа №{{ timelineOrder?.number }}</div>
            <button class="px-2 py-1" @click="timelineOpen=false">✕</button>
          </div>
          <div class="p-4">
            <ol class="relative border-l ml-2 pl-4">
              <li v-for="(ev,i) in (timelineOrder?.history||[])" :key="i" class="mb-4">
                <div class="absolute -left-2 top-0 w-3 h-3 rounded-full bg-indigo-500"></div>
                <div class="text-sm"><b>{{ ev.title }}</b> — <span class="text-gray-500">{{ new Date(ev.at).toLocaleString() }}</span></div>
                <div class="text-xs text-gray-600">{{ ev.note }}</div>
              </li>
              <li v-if="!(timelineOrder?.history||[]).length" class="text-sm text-gray-500">Событий пока нет</li>
            </ol>
          </div>
          <div class="px-4 py-3 border-t bg-gray-50 text-right">
            <button class="btn" @click="timelineOpen=false">Готово</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.select{ @apply rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white; }
.btn{ @apply inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50; }
.card{ @apply rounded-xl border border-gray-200 bg-white shadow-sm; }
.row{ @apply flex items-center px-3 py-2; }
.head{ @apply bg-gray-50 font-medium text-sm; }
.cell{ @apply px-2; }
</style>

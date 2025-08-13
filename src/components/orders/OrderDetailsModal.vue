<!-- src/components/orders/OrderDetailsModal.vue -->
<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
    <div class="bg-white rounded shadow-md w-[880px] max-h-[90vh] mt-12 overflow-auto">
      <header class="p-4 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold">Заказ {{ order?.number || '' }}</h3>
        <button class="text-gray-500" @click="close" aria-label="Закрыть">✕</button>
      </header>

      <section v-if="order && !loading" class="p-4 space-y-4">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-gray-500">Клиент</div>
            <div>{{ order.customerName || '—' }}</div>
          </div>
          <div>
            <div class="text-gray-500">Создан</div>
            <div>{{ dt(order.createdAt) }}</div>
          </div>
          <div>
            <div class="text-gray-500">Тип получения</div>
            <div>{{ order.deliveryType === 'pickup' ? 'Самовывоз' : 'Доставка' }}</div>
          </div>
          <div>
            <div class="text-gray-500">Отгрузка</div>
            <div>{{ dt(order.deliveryAt) }}</div>
          </div>
          <div>
            <div class="text-gray-500">Статус</div>
            <div>{{ statusRu(order.status) }}</div>
          </div>
          <div>
            <div class="text-gray-500">Сумма</div>
            <div class="font-medium">{{ money(order.total) }}</div>
          </div>
        </div>

        <div class="border rounded">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="p-2 text-left">Товар</th>
                <th class="p-2 text-right w-20">Кол-во</th>
                <th class="p-2 text-right w-28">Цена</th>
                <th class="p-2 text-right w-28">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, idx) in order.items" :key="idx" class="border-b">
                <td class="p-2">{{ it.productId }}</td>
                <td class="p-2 text-right">{{ it.qty }}</td>
                <td class="p-2 text-right">{{ money(it.price) }}</td>
                <td class="p-2 text-right">{{ money(it.price * it.qty) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center gap-2">
          <select v-model="nextStatus" class="border rounded px-3 py-2 text-sm">
            <option disabled value="">Изменить статус…</option>
            <option value="paid">Оплачен</option>
            <option value="packed">Собран</option>
            <option value="shipped">Отгружен</option>
            <option value="done">Завершён</option>
            <option value="canceled">Отменён</option>
          </select>

          <button class="border rounded px-3 py-2 text-sm" @click="applyStatus" :disabled="!nextStatus">
            Применить
          </button>

          <button class="ml-auto border rounded px-3 py-2 text-sm" @click="printPick">
            Печать сборочного листа
          </button>
        </div>
      </section>

      <section v-else class="p-6 text-center">Загрузка…</section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Order, OrderStatus } from '@/api/orders'
import { getOrder, updateOrder } from '@/api/orders'

const visible   = ref(false)
const loading   = ref(false)
const order     = ref<Order | null>(null)
const nextStatus = ref<OrderStatus | ''>('')

/** Открыть модалку и загрузить заказ */
async function open(id: string) {
  visible.value = true
  loading.value = true
  nextStatus.value = ''
  try {
    order.value = await getOrder(id)
  } finally {
    loading.value = false
  }
}

/** Закрыть модалку и очистить состояние */
function close() {
  visible.value = false
  order.value = null
  nextStatus.value = ''
}

/** Применить новый статус */
async function applyStatus() {
  if (!order.value || !nextStatus.value) return
  const data = await updateOrder(order.value.id, { status: nextStatus.value })
  order.value = data
  nextStatus.value = ''
}

/** Печать сборочного листа (без <script> в шаблонной строке!) */
function printPick() {
  if (!order.value) return

  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) return

  const rows = (order.value.items || [])
    .map(i => `<tr><td>${escapeHtml(String(i.productId))}</td><td class="num">${i.qty}</td></tr>`)
    .join('')

  const html =
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Сборочный лист ${escapeHtml(String(order.value.number))}</title>
  <style>
    body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial;padding:16px}
    h2{margin:0 0 12px}
    table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #000;padding:6px 8px;font-size:13px}
    th{text-align:left;background:#f3f3f3}
    td.num{text-align:right}
  </style>
</head>
<body>
  <h2>Сборочный лист ${escapeHtml(String(order.value.number))}</h2>
  <p><strong>Клиент:</strong> ${escapeHtml(order.value.customerName || '—')}</p>
  <table>
    <thead><tr><th>Товар</th><th style="width:120px;text-align:right">Кол-во</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
  // Печать запускаем из окна, чтобы не вставлять <script> в строку.
  w.onload = () => { try { w.print() } catch (_) {} }
}

/* ————— Утилиты ————— */

function money(v: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(v || 0)
}

function dt(iso?: string | null) {
  return iso ? new Date(iso).toLocaleString('ru-RU') : '—'
}

const STATUS_RU: Record<OrderStatus, string> = {
  new: 'Новый',
  paid: 'Оплачен',
  packed: 'Собран',
  shipped: 'Отгружен',
  done: 'Завершён',
  canceled: 'Отменён',
}

function statusRu(s: OrderStatus) {
  return STATUS_RU[s] ?? s
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]!))
}

/** Экспорт методов модалки наружу (для страницы заказов) */
defineExpose({ open, close })
</script>

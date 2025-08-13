<template>
  <dialog ref="dlg" class="rounded-xl p-0 w-[1100px] max-w-[96vw]">
    <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
      <div class="font-medium">Заказ {{ order?.number1c || '' }}</div>
      <button class="opacity-70" @click="close">✕</button>
    </div>

    <div class="p-4 space-y-4">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="text-xs uppercase opacity-60 mb-1">Клиент</div>
          <div class="font-medium">{{ order?.clientName }}</div>
          <div class="opacity-70">{{ order?.clientType==='person' ? 'Физ. лицо' : 'Юр. лицо' }}</div>
          <div class="opacity-80" v-if="order?.clientPhone">☎ {{ order?.clientPhone }}</div>
          <div class="opacity-80" v-if="order?.clientEmail">✉ {{ order?.clientEmail }}</div>
        </div>
        <div>
          <div class="text-xs uppercase opacity-60 mb-1">Доставка</div>
          <div class="space-y-2">
            <label><input type="radio" value="pickup" v-model="dType" /> Самовывоз</label>
            <div v-if="dType==='pickup'">
              <select v-model="storeId" class="border rounded px-3 py-2">
                <option :value="s.id" v-for="s in stores" :key="s.id">{{ s.name }}</option>
              </select>
            </div>
            <label><input type="radio" value="delivery" v-model="dType" /> Доставка</label>
            <div v-if="dType==='delivery'">
              <input v-model="address" placeholder="Адрес доставки" class="border rounded px-3 py-2 w-full" />
            </div>
            <div>
              <label class="block text-sm opacity-70 mb-1">Дата/время отгрузки</label>
              <input v-model="shipmentAtLocal" type="datetime-local" class="border rounded px-3 py-2" />
            </div>
            <div v-if="dType==='pickup'">
              <label class="block text-sm opacity-70 mb-1">Код получения</label>
              <div class="flex gap-2 items-center">
                <input v-model="pickupCode" class="border rounded px-3 py-2" />
                <button class="border rounded px-2 py-1 text-xs" @click="regenCode">Сгенерировать</button>
                <button class="border rounded px-2 py-1 text-xs" @click="copy(pickupCode)">Копировать</button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="text-xs uppercase opacity-60 mb-1">Статус</div>
          <select v-model="status" class="border rounded px-3 py-2">
            <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <div class="mt-2 text-sm">Сумма: <b>{{ money(sum) }}</b></div>
        </div>
      </div>

      <div class="border rounded">
        <div class="p-3 border-b font-medium">Товары</div>
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="p-2 text-left w-32">Артикул</th>
              <th class="p-2 text-left">Наименование</th>
              <th class="p-2 text-right w-24">Кол-во</th>
              <th class="p-2 text-right w-28">Цена</th>
              <th class="p-2 text-right w-28">Сумма</th>
              <th class="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it,idx) in items" :key="it.id" class="border-b">
              <td class="p-2">{{ it.article || it.sku || '—' }}</td>
              <td class="p-2">{{ it.name }}</td>
              <td class="p-2 text-right"><input v-model.number="it.qty" type="number" min="0" class="border rounded px-2 py-1 w-20 text-right" /></td>
              <td class="p-2 text-right"><input v-model.number="it.price" type="number" min="0" class="border rounded px-2 py-1 w-24 text-right" /></td>
              <td class="p-2 text-right">{{ money(it.qty*it.price) }}</td>
              <td class="p-2 text-right"><button class="text-red-600 underline text-xs" @click="removeItem(idx)">Удалить</button></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" class="p-2">
                <button class="border rounded px-3 py-2 text-xs" @click="addItem">+ Добавить строку</button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="border rounded">
        <div class="p-3 border-b font-medium">Документы</div>
        <div class="p-3 space-x-3">
          <a v-for="d in order?.docs || []" :key="d.id" :href="d.url" target="_blank" class="underline">{{ d.name }}</a>
          <span v-if="!order?.docs?.length" class="opacity-70">Нет документов</span>
        </div>
      </div>
    </div>

    <div class="p-3 border-t flex justify-between">
      <div class="space-x-2">
        <button class="border rounded px-3 py-2" @click="printPickingLocal">Печать сборочного листа</button>
        <button class="border rounded px-3 py-2" @click="printInvoice">Печать счёта</button>
        <button class="border rounded px-3 py-2" @click="printWaybill">Печать УПД/ТОРГ-12</button>
      </div>
      <div class="space-x-2">
        <button class="border rounded px-3 py-2" @click="close">Закрыть</button>
        <button class="rounded px-3 py-2 bg-black text-white" @click="saveAll">Сохранить</button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Order, OrderItem, OrderStatus, StorePoint } from '@/api/orders'
import { storeNameById, listStores, regeneratePickupCode } from '@/api/orders'

const props = defineProps<{ order: Order | null }>()
const emit = defineEmits(['save', 'close'])

const dlg = ref<HTMLDialogElement|null>(null)
const status = ref<OrderStatus>('new')

// editable fields
const dType = ref<'pickup'|'delivery'>('pickup')
const storeId = ref<string>('')
const address = ref<string>('')
const shipmentAtLocal = ref<string>('')
const pickupCode = ref<string>('')
const items = ref<OrderItem[]>([])
const stores = ref<StorePoint[]>(listStores())

const statuses = [
  { value: 'new', label:'Новый' },
  { value: 'processing', label:'В работе' },
  { value: 'ready', label:'Готов' },
  { value: 'shipped', label:'Отгружен' },
  { value: 'completed', label:'Завершен' },
  { value: 'cancelled', label:'Отменен' },
]

const sum = computed(()=> (items.value||[]).reduce((s,i)=>s + (i.qty||0)*(i.price||0), 0))

function open(){
  const o = props.order!
  status.value = (o?.status || 'new') as OrderStatus
  dType.value = o?.delivery?.type || 'pickup'
  storeId.value = o?.delivery?.storeId || ''
  address.value = o?.delivery?.address || ''
  shipmentAtLocal.value = toLocal(o?.shipmentAt)
  pickupCode.value = o?.pickupCode || ''
  items.value = JSON.parse(JSON.stringify(o?.items || []))
  dlg.value?.showModal()
}
function close(){ dlg.value?.close(); emit('close') }
function saveAll(){
  const patch: Partial<Order> = {
    status: status.value,
    delivery: dType.value==='pickup' ? { type:'pickup', storeId: storeId.value } : { type:'delivery', address: address.value },
    shipmentAt: fromLocal(shipmentAtLocal.value),
    pickupCode: pickupCode.value || undefined,
    items: items.value
  }
  emit('save', patch)
}

function addItem(){ items.value.push({ id: String(Math.random()).slice(2), name:'', qty:1, price:0 }) }
function removeItem(i: number){ items.value.splice(i,1) }

function money(v: number){ return new Intl.NumberFormat('ru-RU', { style:'currency', currency:'RUB', maximumFractionDigits: 0 }).format(v || 0) }
function dateTime(iso?: string){ return iso ? new Date(iso).toLocaleString('ru-RU') : '—' }
function storeName(id?: string){ return storeNameById(id) }
function copy(s?: string){ if(!s) return; navigator.clipboard?.writeText(s) }
function regenCode(){ pickupCode.value = regeneratePickupCode() }

function toLocal(iso?: string){ if(!iso) return ''; const d = new Date(iso); const pad=(n:number)=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes()) }
function fromLocal(local: string){ if(!local) return undefined; const d = new Date(local); return d.toISOString() }

// Printing helpers
function printHtml(title: string, body: string){
  const html = `
  <html><head><meta charset="utf-8"><title>${title}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;font-size:12px}
    h1{font-size:18px;margin:0 0 8px}
    table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #333;padding:6px;vertical-align:top}
    .muted{color:#666}
    .right{text-align:right}
  </style></head><body>${body}
  <script>window.onload=()=>window.print()<\/script>
  </body></html>`
  const w = window.open('', '_blank'); if (!w) return;
  w.document.write(html); w.document.close();
}
function printPickingLocal(){
  const o = props.order!
  const rows = (o.items||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${it.article||it.sku||''}</td><td>${it.name}</td><td class='right'>${it.qty}</td></tr>`).join('')
  const body = `
    <h1>Сборочный лист ${o.number1c}</h1>
    <div class='muted'>Клиент: ${o.clientName} (${o.clientType==='person'?'ФЛ':'ЮЛ'})</div>
    <div class='muted'>Способ: ${o.delivery.type==='pickup'?'Самовывоз из '+storeName(o.delivery.storeId):'Доставка: '+(o.delivery.address||'')}</div>
    <div class='muted'>Отгрузка: ${dateTime(o.shipmentAt)}</div>
    ${o.pickupCode ? `<div class='muted'>Код получения: <b>${o.pickupCode}</b></div>` : ''}
    <br/>
    <table><thead><tr><th>#</th><th>Артикул</th><th>Наименование</th><th>Кол-во</th></tr></thead><tbody>${rows}</tbody></table>
    <br/><div class='muted'>Подпись кладовщика: ____________________</div>`
  printHtml('Сборочный лист '+o.number1c, body)
}
function printInvoice(){
  const o = props.order!
  const rows = (o.items||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${it.name}</td><td class='right'>${it.qty}</td><td class='right'>${it.price}</td><td class='right'>${it.qty*it.price}</td></tr>`).join('')
  const body = `
    <h1>Счёт ${o.number1c}</h1>
    <div class='muted'>Покупатель: ${o.clientName}</div>
    <div class='muted'>Дата отгрузки: ${dateTime(o.shipmentAt)}</div>
    <br/>
    <table><thead><tr><th>#</th><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>${rows}</tbody>
    <tfoot><tr><td colspan='4' class='right'><b>Итого</b></td><td class='right'><b>${o.sum}</b></td></tr></tfoot></table>`
  printHtml('Счёт '+o.number1c, body)
}
function printWaybill(){
  const o = props.order!
  const rows = (o.items||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${it.article||''}</td><td>${it.name}</td><td class='right'>${it.qty}</td></tr>`).join('')
  const body = `
    <h1>УПД / ТОРГ-12 (черновик) ${o.number1c}</h1>
    <div class='muted'>Поставщик: ООО "Ваша компания"</div>
    <div class='muted'>Покупатель: ${o.clientName}</div>
    <br/>
    <table><thead><tr><th>#</th><th>Артикул</th><th>Наименование</th><th>Кол-во</th></tr></thead><tbody>${rows}</tbody></table>`
  printHtml('УПД/ТОРГ-12 '+o.number1c, body)
}

defineExpose({ open, close })
</script>

<style>
dialog::backdrop { background: rgba(0,0,0,.2) }
dialog { border: 1px solid #eee }
</style>

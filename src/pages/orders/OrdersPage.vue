<template>
  <section class="p-6 h-[calc(100vh-88px)] flex flex-col">
    <header class="mb-3">
      <h1 class="text-xl font-semibold">Заказы</h1>
    </header>

    <OrdersTable class="flex-1 border rounded overflow-hidden"
      :items="store.items"
      @set-filter="setFilter"
      @open="open"
      @refresh="store.fetch"
      @set-status="setStatus"
      @export-csv="exportCsv" />

    <OrderDetailsModal ref="refDetails" :order="store.current" @save="save" @close="onClose" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import OrdersTable from '@/components/orders/OrdersTable.vue'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue'

const store = useOrdersStore()
const refDetails = ref<InstanceType<typeof OrderDetailsModal> | null>(null)

function setFilter(f: any){
  if (f.q!=null) store.setQuery(f.q)
  if (f.status!=null) store.setStatus(f.status)
  if (f.delivery!=null) store.setDelivery(f.delivery)
  if (f.dateFrom!=null) store.setDateFrom(f.dateFrom)
  if (f.dateTo!=null) store.setDateTo(f.dateTo)
}

async function open(id: string){
  await store.open(id)
  refDetails.value?.open()
}
async function save(patch: any){
  await store.saveCurrentPatch(patch)
  refDetails.value?.close()
}
function onClose(){ /* noop */ }

async function setStatus({ id, status }: any){
  await store.setStatusFor(id, status)
}

// CSV export of current table
function exportCsv(){
  const rows = store.items.map(o => ({
    number1c: o.number1c,
    client: o.clientName,
    clientType: o.clientType,
    sum: o.sum,
    delivery: o.delivery.type,
    shipmentAt: o.shipmentAt || '',
    point: o.delivery.type==='pickup' ? o.delivery.storeId : (o.delivery.address||''),
    status: o.status
  }))
  const header = ['№1С','Клиент','Тип','Сумма','Доставка','Отгрузка','Пункт/Адрес','Статус']
  const csvRows = [header.join(';')].concat(
    rows.map(r => [r.number1c, r.client, r.clientType, r.sum, r.delivery, r.shipmentAt, r.point, r.status].map(v => String(v).replace(/;/g, ',')).join(';'))
  )
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'orders.csv'; a.click()
  URL.revokeObjectURL(url)
}

onMounted(()=> store.fetch())
</script>

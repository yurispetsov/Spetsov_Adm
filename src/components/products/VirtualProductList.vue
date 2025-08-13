<template>
  <div class="h-full flex flex-col">
    <div class="p-3 border-b grid grid-cols-12 gap-2 items-center">
      <input v-model="q" placeholder="Поиск (имя, sku, артикул)" class="border rounded px-3 py-2 col-span-4" />
      <select v-model="status" class="border rounded px-3 py-2 col-span-2">
        <option value="">Все статусы</option>
        <option value="active">Активен</option>
        <option value="draft">Черновик</option>
        <option value="archived">Архив</option>
      </select>
      <input v-model.number="minPrice" type="number" placeholder="Цена ≥" class="border rounded px-3 py-2 col-span-2" />
      <input v-model.number="maxPrice" type="number" placeholder="Цена ≤" class="border rounded px-3 py-2 col-span-2" />
      <div class="col-span-2 flex items-center gap-2">
        <select v-model="sortBy" class="border rounded px-2 py-2">
          <option value="name">Имя</option>
          <option value="price">Цена</option>
          <option value="updatedAt">Обновлено</option>
        </select>
        <button class="border rounded px-2 py-2" @click="toggleDir">{{ sortDir==='asc' ? '▲' : '▼' }}</button>
      </div>
    </div>

    <div class="flex-1 overflow-auto relative" ref="scroller" @scroll="onScroll">
      <div :style="{ height: totalHeight + 'px', position: 'relative' }">
        <div v-for="row in windowRows" :key="row.p.id"
             :style="{ position: 'absolute', top: (row.pos) + 'px', left: 0, right: 0, height: rowH + 'px' }"
             draggable="true" @dragstart="e=>onDragStart(e, row.p.id)"
             class="grid grid-cols-12 items-center border-b px-2">
          <div class="col-span-1 text-center">
            <input type="checkbox" :checked="selection.includes(row.p.id)" @change="$emit('toggle', row.p.id)" />
          </div>
          <div class="col-span-2">{{ row.p.article }}</div>
          <div class="col-span-5 truncate">{{ row.p.name }}</div>
          <div class="col-span-2">{{ row.p.sku }}</div>
          <div class="col-span-2 text-right">{{ row.p.price.toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@/types/Product'
import { computed, ref, watch } from 'vue'

const props = defineProps<{ items: Product[], selection: string[] }>()
const emit = defineEmits(['set-filter','set-sort','toggle'])

const q = ref(''); const status = ref(''); const minPrice = ref<number|null>(null); const maxPrice = ref<number|null>(null)
const sortBy = ref<'name'|'price'|'updatedAt'>('updatedAt')
const sortDir = ref<'asc'|'desc'>('desc')
watch([q,status,minPrice,maxPrice], () => {
  emit('set-filter', {
    q: q.value || undefined,
    status: status.value ? [status.value] : undefined,
    priceMin: minPrice.value ?? undefined,
    priceMax: maxPrice.value ?? undefined,
  })
})
watch([sortBy,sortDir], () => emit('set-sort', { by: sortBy.value, dir: sortDir.value }))
function toggleDir(){ sortDir.value = sortDir.value==='asc' ? 'desc' : 'asc' }

// virtual window
const rowH = 36
const scroller = ref<HTMLElement|null>(null)
const start = ref(0); const end = ref(0)
const totalHeight = computed(()=> props.items.length * rowH)
function onScroll(){
  const el = scroller.value!
  const s = Math.floor(el.scrollTop / rowH) - 6
  const e = s + Math.ceil(el.clientHeight / rowH) + 12
  start.value = Math.max(0,s); end.value = Math.min(props.items.length, e)
}
const windowRows = computed(() => {
  const out = []
  for (let i=start.value;i<end.value;i++){
    out.push({ p: props.items[i], pos: i*rowH })
  }
  return out
})
function onDragStart(e: DragEvent, id: string){
  e.dataTransfer?.setData('text/plain', 'products:'+id)
  e.dataTransfer?.setDragImage(new Image(), 0, 0)
}
</script>

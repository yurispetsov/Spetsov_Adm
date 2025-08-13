<template>
  <div class="h-full flex flex-col">
    <div class="p-3 border-b grid grid-cols-12 gap-2 items-center">
      <input v-model="q" placeholder="Поиск по товарам (имя, sku, артикул)" class="border rounded px-3 py-2 col-span-5" />
      <select v-model="status" class="border rounded px-3 py-2 col-span-2">
        <option value="">Все статусы</option>
        <option value="active">Активен</option>
        <option value="draft">Черновик</option>
        <option value="archived">Архив</option>
      </select>
      <div class="col-span-3 flex items-center gap-2">
        <label class="text-sm opacity-70">Сортировка:</label>
        <select v-model="sortBy" class="border rounded px-2 py-2">
          <option value="name">Имя</option>
          <option value="price">Цена</option>
          <option value="updatedAt">Обновлено</option>
        </select>
        <button class="border rounded px-2 py-2" @click="toggleDir">{{ sortDir==='asc' ? '▲' : '▼' }}</button>
      </div>
      <button class="border rounded px-3 py-2 col-span-2" :disabled="!selection.length" draggable="true" @dragstart="onDragStartSelected">
        Перетащить выделенные ({{ selection.length }})
      </button>
    </div>

    <div class="overflow-auto">
      <table class="min-w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 shadow">
          <tr>
            <th class="p-2 w-8"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
            <th class="p-2">Артикул</th>
            <th class="p-2 text-left">Название</th>
            <th class="p-2">SKU</th>
            <th class="p-2 text-right">Цена</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in items" :key="p.id" class="border-t" draggable="true" @dragstart="onDragStart(p)">
            <td class="p-2 text-center">
              <input type="checkbox" :checked="selection.includes(p.id)" @change="toggle(p.id)" />
            </td>
            <td class="p-2">{{ p.article }}</td>
            <td class="p-2">{{ p.name }}</td>
            <td class="p-2">{{ p.sku }}</td>
            <td class="p-2 text-right">{{ p.price.toLocaleString() }}</td>
          </tr>
          <tr v-if="!items.length">
            <td class="p-4 text-center text-gray-500" colspan="5">Нет товаров</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@/types/Product'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  items: Product[]
  selection: string[]
}>()
const emit = defineEmits(['set-filter','set-sort','toggle','toggle-all'])

const q = ref('')
const status = ref('')
const sortBy = ref<'name'|'price'|'updatedAt'>('updatedAt')
const sortDir = ref<'asc'|'desc'>('desc')

watch([q, status], () => {
  emit('set-filter', {
    q: q.value || undefined,
    status: status.value ? [status.value] : undefined,
  })
})
watch([sortBy, sortDir], () => {
  emit('set-sort', { by: sortBy.value, dir: sortDir.value })
})
function toggleDir() { sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc' }

const allSelected = computed(() => props.items.length && props.items.every(p => props.selection.includes(p.id)))
function toggleAll(e: Event) {
  emit('toggle-all', (e.target as HTMLInputElement).checked)
}
function toggle(id: string) { emit('toggle', id) }

function onDragStart(p: Product) {
  const dt: DataTransfer | null = (event as DragEvent).dataTransfer || null
  if (!dt) return
  dt.setData('text/plain', 'products:' + [p.id].join(','))
}
function onDragStartSelected(e: DragEvent) {
  if (!props.selection.length) return
  const dt: DataTransfer | null = (e as any).dataTransfer || null
  if (!dt) return
  dt.setData('text/plain', 'products:' + props.selection.join(','))
}
</script>

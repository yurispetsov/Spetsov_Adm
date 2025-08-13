<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <input v-model="q" placeholder="Поиск по названию, SKU, артикулу"
             class="border rounded px-3 py-2 flex-1 min-w-[240px]" />
      <select v-model="statusFilter" class="border rounded px-3 py-2">
        <option value="">Все статусы</option>
        <option value="active">Активен</option>
        <option value="draft">Черновик</option>
        <option value="archived">Архив</option>
      </select>
      <button class="border rounded px-3 py-2" @click="emit('create')">+ Создать</button>
      <button class="border rounded px-3 py-2" :disabled="!selection.length" @click="emit('bulk-remove')">Удалить выбранные</button>
    </div>

    <div class="flex flex-wrap items-center gap-3 text-sm">
      <span class="opacity-70">Склады:</span>
      <label v-for="k in availableWarehouses" :key="k" class="flex items-center gap-1">
        <input type="checkbox" :value="k" v-model="visibleWarehousesProxy" />
        <span class="uppercase">{{ shortWh(k) }}</span>
      </label>
    </div>

    <div class="overflow-auto border rounded">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-2 w-10"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
            <th class="p-2 text-left">Артикул</th>
            <th class="p-2 text-left cursor-pointer select-none" @click="setSort('name')">
              Название <SortIcon :active="sort.by==='name'" :dir="sort.dir" />
            </th>
            <th class="p-2 text-right cursor-pointer select-none" @click="setSort('price')">
              Цена <SortIcon :active="sort.by==='price'" :dir="sort.dir" />
            </th>
            <th v-for="k in visibleWarehouses" :key="k" class="p-2 text-right uppercase">
              {{ shortWh(k) }}
            </th>
            <th class="p-2 text-right cursor-pointer select-none" @click="setSort('stock')">
              Остаток <SortIcon :active="sort.by==='stock'" :dir="sort.dir" />
            </th>
            <th class="p-2 cursor-pointer select-none" @click="setSort('updatedAt')">
              Обновлено <SortIcon :active="sort.by==='updatedAt'" :dir="sort.dir" />
            </th>
            <th class="p-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in items" :key="p.id" class="border-t">
            <td class="p-2 text-center">
              <input type="checkbox" :checked="selection.includes(p.id)" @change="emit('toggle-select', p.id)" />
            </td>
            <td class="p-2">{{ p.article }}</td>
            <td class="p-2">{{ p.name }}</td>
            <td class="p-2 text-right">{{ p.price.toLocaleString() }}</td>
            <td v-for="k in visibleWarehouses" :key="k" class="p-2 text-right">
              {{ (p.warehouses && p.warehouses[k]) ? p.warehouses[k] : 0 }}
            </td>
            <td class="p-2 text-right">{{ stockTotal(p) }}</td>
            <td class="p-2">{{ new Date(p.updatedAt).toLocaleString() }}</td>
            <td class="p-2 text-right">
              <button class="underline" @click="emit('edit', p.id)">Изменить</button>
              <button class="underline ml-2" @click="emit('remove', p.id)">Удалить</button>
            </td>
          </tr>
          <tr v-if="!items.length">
            <td class="p-6 text-center text-gray-500" :colspan="8 + visibleWarehouses.length">Ничего не найдено</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between pt-2">
      <div class="text-sm opacity-70">Всего: {{ total }}</div>
      <div class="flex items-center gap-2">
        <button class="border rounded px-3 py-1" :disabled="page<=1" @click="emit('set-page', page-1)">Назад</button>
        <span class="text-sm">Стр. {{ page }}</span>
        <button class="border rounded px-3 py-1" :disabled="page*pageSize>=total" @click="emit('set-page', page+1)">Вперёд</button>
        <select class="border rounded px-2 py-1" :value="pageSize" @change="emit('set-page-size', +($event.target as HTMLSelectElement).value)">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, ProductSort, SortBy } from '@/types/Product'
import { computed, ref, watch, defineComponent } from 'vue'  // <-- добавлен defineComponent

const props = defineProps<{
  items: Product[]
  total: number
  page: number
  pageSize: number
  selection: string[]
  sort: ProductSort
  availableWarehouses: string[]
  visibleWarehouses: string[]
}>()

const emit = defineEmits([
  'create','edit','remove','bulk-remove','toggle-select',
  'set-page','set-page-size','set-filter','set-sort','set-visible-warehouses'
])

const q = ref('')
const statusFilter = ref('')

watch([q, statusFilter], () => {
  emit('set-filter', {
    q: q.value || undefined,
    status: statusFilter.value ? [statusFilter.value] : undefined,
  })
})

const allSelected = computed(() => props.items.length && props.items.every(p => props.selection.includes(p.id)))
function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) {
    props.items.forEach(p => emit('toggle-select', p.id))
  } else {
    // consumers expected to clear selection themselves
  }
}

function setSort(by: SortBy) {
  emit('set-sort', by)
}

function stockTotal(p: Product) {
  if (!props.visibleWarehouses?.length) {
    return Object.values(p.warehouses || {}).reduce((a,b)=>a+(b||0), 0)
  }
  const set = new Set(props.visibleWarehouses)
  return Object.entries(p.warehouses || {}).reduce((a,[k,v]) => a + (set.has(k) ? (v||0) : 0), 0)
}

const visibleWarehousesProxy = computed({
  get: () => props.visibleWarehouses,
  set: (val: string[]) => emit('set-visible-warehouses', val),
})

function shortWh(k: string) {
  return k.replace(/^wh_/, '').toUpperCase()
}

const SortIcon = defineComponent({
  props: { active: Boolean, dir: { type: String, default: 'asc' } },
  setup(p) { return () => p.active ? (p.dir === 'asc' ? '▲' : '▼') : '' }
})
</script>

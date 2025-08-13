<template>
  <div class="border rounded h-full flex flex-col">
    <div class="p-3 border-b flex items-center justify-between">
      <div class="font-medium">Товары в категории</div>
      <input v-model="q" class="border rounded px-3 py-1.5" placeholder="Поиск...">
    </div>
    <div class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 border-b">
          <tr>
            <th class="p-2 text-left w-28">Артикул</th>
            <th class="p-2 text-left w-28">SKU</th>
            <th class="p-2 text-left">Название</th>
            <th class="p-2 text-right w-24">Остаток</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in items" :key="p.id" class="border-b hover:bg-gray-50"
              draggable="true" @dragstart="onDragStart($event, p)">
            <td class="p-2">{{ p.article }}</td>
            <td class="p-2">{{ p.sku }}</td>
            <td class="p-2">{{ p.name }}</td>
            <td class="p-2 text-right">{{ stock(p) }}</td>
          </tr>
          <tr v-if="!items.length"><td colspan="4" class="p-6 text-center opacity-70">Нет товаров</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { listByCategory, sumStock, type Product } from '@/api/products'

const props = defineProps<{ categoryId?: string|null }>()
const q = ref('')
const items = ref<Product[]>([])

function load(){ items.value = listByCategory(props.categoryId, { q: q.value }) }

watch(()=>props.categoryId, load, { immediate: true })
watch(q, load)
function onChanged(){ load() }
onMounted(()=> window.addEventListener('products-changed', onChanged))
onBeforeUnmount(()=> window.removeEventListener('products-changed', onChanged))

function onDragStart(ev: DragEvent, p: Product){
  ev.dataTransfer?.setData('application/x-products', JSON.stringify([p.id]))
  ev.dataTransfer?.setData('text/plain', 'products-dnd')
}
function stock(p: Product){ return sumStock(p) }
</script>

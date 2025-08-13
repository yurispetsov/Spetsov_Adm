<template>
  <section class="p-6 h-[calc(100vh-88px)] flex flex-col">
    <header class="mb-3 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Товары</h1>
      <div class="flex gap-2">
        <input v-model="q" placeholder="Поиск (имя, sku, артикул)" class="border rounded px-3 py-2 w-72">
        <select v-model="sort" class="border rounded px-3 py-2">
          <option value="name">По имени</option>
          <option value="price">По цене</option>
          <option value="stock">По остатку</option>
          <option value="updated">По обновлению</option>
          <option value="active">По активности</option>
        </select>
      </div>
    </header>

    <div class="mb-2 flex items-center gap-2" v-if="selected.size">
      <div class="text-sm">Выбрано: {{ selected.size }}</div>
      <button class="border rounded px-2 py-1" @click="openPicker">Переместить…</button>
      <button class="border rounded px-2 py-1" @click="setActive(true)">Активировать</button>
      <button class="border rounded px-2 py-1" @click="setActive(false)">Скрыть</button>
      <button class="border rounded px-2 py-1 text-red-600" @click="removeSelected">Удалить</button>
    </div>

    <div class="flex-1 border rounded overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 border-b">
          <tr>
            <th class="p-2 w-8">
              <input type="checkbox" :checked="allChecked" @change="toggleAll(($event.target as HTMLInputElement).checked)" />
            </th>
            <th class="p-2 text-left w-28">Артикул</th>
            <th class="p-2 text-left w-28">SKU</th>
            <th class="p-2 text-left">Название</th>
            <th class="p-2 text-right w-28">Цена</th>
            <th class="p-2 text-right w-24">Остаток</th>
            <th class="p-2 text-left w-32">Категория</th>
            <th class="p-2 text-left w-40">Обновление</th>
            <th class="p-2 text-right w-28"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in items" :key="p.id" class="border-b hover:bg-gray-50"
              draggable="true" @dragstart="onDragStart($event, p)">
            <td class="p-2">
              <input type="checkbox" :checked="selected.has(p.id)" @change="toggle(p.id, ($event.target as HTMLInputElement).checked)" />
            </td>
            <td class="p-2">{{ p.article }}</td>
            <td class="p-2">{{ p.sku }}</td>
            <td class="p-2"><span :class="p.active ? '' : 'opacity-50'">{{ p.name }}</span></td>
            <td class="p-2 text-right">{{ money(p.price) }}</td>
            <td class="p-2 text-right">{{ sumStock(p) }}</td>
            <td class="p-2">{{ p.categoryId || '—' }}</td>
            <td class="p-2">{{ dt(p.updatedAt) }}</td>
            <td class="p-2 text-right">
              <button class="underline text-xs mr-2" @click="edit(p)">Изм.</button>
              <button class="underline text-red-600 text-xs" @click="removeOne(p.id)">Удалить</button>
            </td>
          </tr>
          <tr v-if="!items.length">
            <td colspan="9" class="p-6 text-center opacity-70">Ничего не найдено</td>
          </tr>
        </tbody>
      </table>
    </div>

    <ProductEditModal ref="refEdit" :value="editing" @submit="save" @close="editing=null" />
    <CategoryPickerModal ref="refPicker" @pick="doMove" />
  </section>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue'
import { listProducts, deleteProduct, sumStock, type Product, saveProduct, toggleActive, moveProductsToCategory } from '@/api/products'
import ProductEditModal from '@/components/products/ProductEditModal.vue'
import CategoryPickerModal from '@/components/products/CategoryPickerModal.vue'

const q = ref('')
const sort = ref<'name'|'price'|'stock'|'updated'|'active'>('name')
const items = ref<Product[]>([])
const selected = ref<Set<string>>(new Set())

watchEffect(()=>{
  items.value = listProducts({ q: q.value, sort: sort.value })
  const ids = new Set(items.value.map(x=>x.id))
  selected.value.forEach(id => { if (!ids.has(id)) selected.value.delete(id) })
})

const allChecked = computed(()=> items.value.length>0 && items.value.every(x=>selected.value.has(x.id)) )
function toggleAll(flag: boolean){ items.value.forEach(x=> flag ? selected.value.add(x.id) : selected.value.delete(x.id)) }
function toggle(id: string, flag: boolean){ flag ? selected.value.add(id) : selected.value.delete(id) }

function removeOne(id: string){ deleteProduct(id); items.value = listProducts({ q: q.value, sort: sort.value }) }
function removeSelected(){ if (!selected.value.size) return; if (!confirm('Удалить выбранные товары?')) return; selected.value.forEach(id=>deleteProduct(id)); items.value = listProducts({ q: q.value, sort: sort.value }); selected.value.clear() }
function setActive(flag: boolean){ if (!selected.value.size) return; toggleActive(Array.from(selected.value), flag); items.value = listProducts({ q: q.value, sort: sort.value }) }

const refEdit = ref<InstanceType<typeof ProductEditModal>|null>(null)
const refPicker = ref<InstanceType<typeof CategoryPickerModal>|null>(null)
const editing = ref<Product|null>(null)
function edit(p: Product){ editing.value = p; refEdit.value?.open() }
function save(data: any){ saveProduct(data); items.value = listProducts({ q: q.value, sort: sort.value }); editing.value=null }

function openPicker(){ refPicker.value?.open() }
function doMove(categoryId: string){ moveProductsToCategory(Array.from(selected.value), categoryId); items.value = listProducts({ q: q.value, sort: sort.value }); selected.value.clear() }

function onDragStart(ev: DragEvent, p: Product){
  const ids = selected.value.has(p.id) ? Array.from(selected.value) : [p.id]
  ev.dataTransfer?.setData('application/x-products', JSON.stringify(ids))
  ev.dataTransfer?.setData('text/plain', 'products-dnd')
}
function money(v: number){ return new Intl.NumberFormat('ru-RU', { style:'currency', currency:'RUB', maximumFractionDigits:0 }).format(v) }
function dt(iso?: string){ return iso ? new Date(iso).toLocaleString('ru-RU') : '—' }
</script>

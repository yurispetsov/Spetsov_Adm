<template>
  <section class="p-6 h-[calc(100vh-88px)] flex flex-col">
    <header class="mb-3 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Товары</h1>
      <div class="flex gap-2">
        <input v-model="store.q" placeholder="Поиск (имя, sku, артикул)" class="border rounded px-3 py-2 w-72" @input="store.fetch">
        <select v-model="store.sort" class="border rounded px-3 py-2" @change="store.fetch">
          <option value="name">По имени</option>
          <option value="price">По цене</option>
          <option value="stock">По остатку</option>
          <option value="updated">По обновлению</option>
          <option value="active">По активности</option>
        </select>
        <button class="border rounded px-3 py-2" @click="createItem">+ Создать</button>
      </div>
    </header>

    <div class="mb-2 flex items-center gap-2" v-if="store.selected.size">
      <div class="text-sm">Выбрано: {{ store.selected.size }}</div>
      <button class="border rounded px-2 py-1" @click="openPicker">Переместить…</button>
      <button class="border rounded px-2 py-1" @click="store.setActive(true)">Активировать</button>
      <button class="border rounded px-2 py-1" @click="store.setActive(false)">Скрыть</button>
      <button class="border rounded px-2 py-1 text-red-600" @click="removeSelected">Удалить</button>
    </div>

    <div class="flex-1 border rounded overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 border-b">
          <tr>
            <th class="p-2 w-8"><input type="checkbox" :checked="allChecked" @change="toggleAll(($event.target as HTMLInputElement).checked)" /></th>
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
          <tr v-for="p in store.items" :key="p.id" class="border-b hover:bg-gray-50">
            <td class="p-2"><input type="checkbox" :checked="store.selected.has(p.id)" @change="store.toggleSelect(p.id, ($event.target as HTMLInputElement).checked)" /></td>
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
          <tr v-if="!store.items.length"><td colspan="9" class="p-6 text-center opacity-70">Ничего не найдено</td></tr>
        </tbody>
      </table>
    </div>

    <ProductEditModal ref="refEdit" @submit="save" />
    <CategoryPickerModal ref="refPicker" @pick="doMove" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { sumStock } from '@/api/products';
import { useProductsStore } from '@/stores/products';
import ProductEditModal from '@/components/products/ProductEditModal.vue';
import CategoryPickerModal from '@/components/products/CategoryPickerModal.vue';

const store = useProductsStore();
const refEdit = ref<InstanceType<typeof ProductEditModal> | null>(null);
const refPicker = ref<InstanceType<typeof CategoryPickerModal> | null>(null);

onMounted(()=> store.fetch());

const allChecked = computed(()=> store.items.length>0 && store.items.every(x=>store.selected.has(x.id)) );
function toggleAll(flag: boolean){ store.items.forEach(x=> flag ? store.selected.add(x.id) : store.selected.delete(x.id)) }
function money(v: number){ return new Intl.NumberFormat('ru-RU', { style:'currency', currency:'RUB', maximumFractionDigits:0 }).format(v || 0) }
function dt(iso?: string){ return iso ? new Date(iso).toLocaleString('ru-RU') : '—' }

function createItem(){ store.startEdit(); refEdit.value?.open(); }
function edit(p: any){ store.startEdit(p); refEdit.value?.open(p); }
async function save(data: any){ await store.saveEditing(data); }

function openPicker(){ refPicker.value?.open(); }
async function doMove(categoryId: string){ await store.moveSelected(categoryId); }
async function removeSelected(){ if (!confirm('Удалить выбранные товары?')) return; await store.removeSelected(); }
async function removeOne(id: string){ if (!confirm('Удалить товар?')) return; await store.removeOne(id); }
</script>

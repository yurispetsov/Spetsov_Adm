<template>
  <section class="p-6 space-y-4">
    <h1 class="text-2xl font-semibold">Товары</h1>

    <ProductTable
      :items="store.items"
      :total="store.total"
      :page="store.page"
      :pageSize="store.pageSize"
      :selection="store.selection"
      :sort="store.sort"
      :availableWarehouses="store.availableWarehouses"
      :visibleWarehouses="visibleWarehouses"
      @create="openCreate"
      @edit="openEdit"
      @remove="removeOne"
      @bulk-remove="removeSelected"
      @toggle-select="store.toggleSelect"
      @set-page="setPage"
      @set-page-size="setPageSize"
      @set-filter="setFilter"
      @set-sort="setSort"
      @set-visible-warehouses="setVisibleWarehouses"
    />

    <dialog ref="dlg" class="rounded-xl p-0 w-[980px] max-w-[95vw] max-h-[90vh]">
      <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <div class="font-medium">{{ editingId ? 'Изменить товар' : 'Создать товар' }}</div>
        <button class="text-sm opacity-70" @click="closeDlg">✕</button>
      </div>
      <div class="p-4 overflow-auto" style="max-height: calc(90vh - 56px)">
        <ProductForm :value="editingValue" @submit="save" @cancel="closeDlg" />
      </div>
    </dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ProductTable from '@/components/products/ProductTable.vue'
import ProductForm from '@/components/products/ProductForm.vue'
import { useProductsStore } from '@/stores/products'

const store = useProductsStore()

const dlg = ref<HTMLDialogElement | null>(null)
const editingId = ref<string | null>(null)
const visibleWarehouses = ref<string[]>(['wh_msk','wh_spb'])

watch(visibleWarehouses, () => {
  store.setStockSortKeys(visibleWarehouses.value)
  store.fetch()
})

const editingValue = computed(() => {
  return editingId.value ? store.items.find(i => i.id === editingId.value) ?? null : null
})

function openCreate() {
  editingId.value = null
  dlg.value?.showModal()
}
function openEdit(id: string) {
  editingId.value = id
  dlg.value?.showModal()
}
function closeDlg() { dlg.value?.close() }

async function save(payload: any) {
  if (editingId.value) await store.update(editingId.value, payload)
  else await store.create(payload as any)
  closeDlg()
}

async function removeOne(id: string) {
  await store.remove(id)
}
async function removeSelected() {
  await store.removeSelected()
}
function setPage(p: number) { store.setPage(p); store.fetch() }
function setPageSize(n: number) { store.setPageSize(n); store.fetch() }
function setFilter(f: any) { store.setFilter(f); store.fetch() }
function setSort(by: any) { store.setSort(by); store.fetch() }
function setVisibleWarehouses(val: string[]) { visibleWarehouses.value = val }

onMounted(() => store.fetch())
</script>

<style>
dialog::backdrop { background: rgba(0,0,0,.2); }
dialog { border: 1px solid #eee; }
</style>

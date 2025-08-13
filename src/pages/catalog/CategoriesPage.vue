<template>
  <section class="p-6 h-[calc(100vh-88px)]" @keydown="onKey" tabindex="0">
    <Toast :message="undo.toast?.message || null" />

    <div class="flex h-full gap-3">
      <!-- Left: Virtual Tree -->
      <aside class="border rounded overflow-hidden flex flex-col" :style="{ width: leftWidth + 'px' }">
        <VirtualCategoryTree
          v-model:search="search"
          :tree="store.tree"
          :expanded="store.expanded"
          :selectedId="store.selectedId"
          @toggle="store.toggleExpand"
          @select="openEdit"
          @edit="openEdit"
          @delete="confirmDelete"
          @create-root="createRoot"
          @create-child="createChild"
          @expand-all="store.expandAll"
          @collapse-all="store.collapseAll"
          @move="onMoveCategory"
          @drop-products="onDropProducts"
        />
      </aside>

      <div class="w-1 cursor-col-resize bg-gray-200 hover:bg-gray-300" @mousedown="startResize"></div>

      <!-- Right: Virtual Product List -->
      <main class="flex-1 border rounded overflow-hidden flex flex-col">
        <div class="p-3 border-b flex items-center justify-between">
          <div class="font-medium">Товары (drag&drop на папку слева)</div>
          <div class="text-sm opacity-70 truncate" v-if="currentCategoryName">
            Текущая папка: <b>{{ currentCategoryName }}</b>
          </div>
        </div>
        <VirtualProductList
          :items="products.items"
          :selection="products.selection"
          @set-filter="setProductsFilter"
          @set-sort="setProductsSort"
          @toggle="products.toggleSelect"
        />
      </main>
    </div>

    <!-- Modals -->
    <CategoryEditModal ref="modalRef" :value="modalValue" :title="modalTitle" :parentOptions="parentOptions" @submit="saveCategory" />
    <dialog ref="confirmDlg" class="rounded-xl p-0 w-[520px] max-w-[95vw]">
      <div class="p-4 border-b font-medium">Удалить категорию?</div>
      <div class="p-4">Категория и все её подкатегории будут удалены. Действие нельзя отменить.</div>
      <div class="p-3 border-t flex justify-end gap-2">
        <button class="border rounded px-3 py-1" @click="confirmDlg?.close()">Отмена</button>
        <button class="rounded px-3 py-1 bg-red-600 text-white" @click="confirmOk">Удалить</button>
      </div>
    </dialog>

    <CommandPalette ref="paletteRef" @exec="onCommandExec" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useProductsStore } from '@/stores/products'
import { useUndoStore } from '@/stores/undo'
import CategoryEditModal from '@/components/categories/CategoryEditModal.vue'
import VirtualCategoryTree from '@/components/categories/VirtualCategoryTree.vue'
import VirtualProductList from '@/components/products/VirtualProductList.vue'
import CommandPalette from '@/components/ui/CommandPalette.vue'
import Toast from '@/components/ui/Toast.vue'

const store = useCategoriesStore()
const products = useProductsStore()
const undo = useUndoStore()

// left panel resize
const LS_KEY = '__ui_cat_left_w__'
const leftWidth = ref<number>(parseInt(localStorage.getItem(LS_KEY) || '360', 10) || 360)
function startResize(e: MouseEvent) {
  const startX = e.clientX, startW = leftWidth.value
  const onMove = (ev: MouseEvent) => { const dx = ev.clientX - startX; leftWidth.value = Math.min(700, Math.max(280, startW + dx)) }
  const onUp = () => { localStorage.setItem(LS_KEY, String(leftWidth.value)); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
}

const search = computed({ get: () => store.search, set: (v: string) => store.setSearch(v) })
const modalRef = ref<InstanceType<typeof CategoryEditModal> | null>(null)
const modalValue = ref<any>(null); const modalTitle = ref('')
const confirmDlg = ref<HTMLDialogElement | null>(null); const toDeleteId = ref<string | null>(null)
const paletteRef = ref<InstanceType<typeof CommandPalette> | null>(null)

const parentOptions = computed(() => {
  const exclude = new Set<string>()
  if (store.selectedId) { function walk(id: string) { exclude.add(id); store.flat.filter(c => c.parentId === id).forEach(c => walk(c.id)) } ; walk(store.selectedId) }
  return store.flat.filter(c => !exclude.has(c.id)).map(c => ({ id: c.id, name: c.name }))
})

function openEdit(id: string) { store.setSelected(id); modalValue.value = store.selected; modalTitle.value = 'Изменить категорию'; modalRef.value?.open() }
function createRoot() { store.createRoot() }
async function createChild(parentId: string) { await store.createChild(parentId) }
function confirmDelete(id: string) { toDeleteId.value = id; confirmDlg.value?.showModal() }
function confirmOk() { if (toDeleteId.value) store.removeCategory(toDeleteId.value); confirmDlg.value?.close() }
async function saveCategory(patch: any) { if (!store.selected) return; await store.saveCategory(store.selected.id, patch) }

function setProductsFilter(f: any) { products.setFilter({ ...products.filter, ...f }); products.fetch() }
function setProductsSort(s: any) { products.setSort(s.by); products.sort.dir = s.dir; products.fetch() }

async function onDropProducts(payload: { categoryId: string, ids: string[] }) {
  const prev = products.items.filter(p => payload.ids.includes(p.id)).map(p => ({ id: p.id, categoryId: p.categoryId }))
  await products.assignToCategory(payload.ids, payload.categoryId)
  undo.push({
    label: `Назначено ${payload.ids.length} SKU`,
    do: async () => { await products.assignToCategory(payload.ids, payload.categoryId) },
    undo: async () => { await Promise.all(prev.map(x => products.assignToCategory([x.id], x.categoryId as any))) }
  })
}

// ✅ Явно объявили обработчик, чтобы не было "…not defined on instance"
async function onMoveCategory(payload: { id: string; newParentId: string | null }) {
  const id = payload.id
  const before = store.flat.find(c => c.id === id)
  await store.move(payload)
  undo.push({
    label: 'Перемещена категория',
    do: async () => { await store.move(payload) },
    undo: async () => { await store.saveCategory(id, { parentId: before?.parentId || null }) }
  })
}

// ✅ И явный обработчик команды из палитры
function onCommandExec(id: string){
  if (id==='newRoot') createRoot()
  if (id==='newChild' && store.selectedId) createChild(store.selectedId)
  if (id==='rename' && store.selectedId) openEdit(store.selectedId)
  if (id==='delete' && store.selectedId) confirmDelete(store.selectedId)
  if (id==='expandAll') store.expandAll()
  if (id==='collapseAll') store.collapseAll()
}

const currentCategoryName = computed(() => {
  const id = store.selectedId
  return id ? (store.flat.find(c => c.id === id)?.name || '') : ''
})

// hotkeys
function onKey(e: KeyboardEvent){
  if (e.ctrlKey && e.key.toLowerCase()==='k'){ e.preventDefault(); paletteRef.value?.open(); return }
  if (e.ctrlKey && e.key.toLowerCase()==='z'){ e.preventDefault(); undo.undo(); return }
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='z'){ e.preventDefault(); undo.redo(); return }
  if (e.key==='Delete' && store.selectedId){ e.preventDefault(); confirmDelete(store.selectedId) }
  if (e.key==='F2' && store.selectedId){ e.preventDefault(); openEdit(store.selectedId) }
  if (e.ctrlKey && e.key.toLowerCase()==='n'){ e.preventDefault(); createRoot() }
}

onMounted(()=>{ store.fetch(); products.fetch() })
</script>

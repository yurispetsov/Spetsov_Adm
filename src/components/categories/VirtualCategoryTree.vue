<template>
  <div class="h-full flex flex-col">
    <div class="flex gap-2 items-center p-2 border-b bg-white sticky top-0 z-10">
      <input :value="search" @input="onSearchInput($event)" placeholder="Поиск по узлам"
             class="border rounded px-3 py-2 flex-1 min-w-[160px]" />
      <button class="border rounded px-3 py-2" @click="$emit('expand-all')">Развернуть</button>
      <button class="border rounded px-3 py-2" @click="$emit('collapse-all')">Свернуть</button>
      <button class="border rounded px-3 py-2" @click="$emit('create-root')">+ Корневая</button>
    </div>

    <div ref="scrollRef" class="overflow-auto relative" @scroll="onScroll" style="will-change: transform;">
      <div :style="{ height: totalHeight + 'px', position: 'relative' }">
        <div v-for="row in windowRows" :key="row.node.id"
             :style="{ position: 'absolute', top: (row.pos) + 'px', left: 0, right: 0, height: rowHeight + 'px' }">
          <div :class="['flex items-center gap-2 px-2 py-1 rounded cursor-pointer select-none',
                        row.selected ? 'bg-indigo-50' : row.isOver ? 'bg-green-50' : 'hover:bg-gray-50']"
               :style="{ paddingLeft: (row.level*16) + 'px' }"
               draggable="true"
               @dragstart="e=>onDragStart(e, row.node.id)"
               @dragover.prevent="e=>onDragOver(e, row)"
               @dragleave="row.isOver=false"
               @drop.prevent="e=>onDrop(e, row)">
            <button class="w-5 text-center" @click="$emit('toggle', row.node.id)">
              <span v-if="row.node.children.length">{{ expanded.has(row.node.id) ? '▾' : '▸' }}</span>
              <span v-else>·</span>
            </button>
            <div class="flex-1" @click="$emit('select', row.node.id)">
              <span class="font-medium truncate">{{ row.node.name }}</span>
              <span class="ml-2 text-xs opacity-60 truncate">/ {{ row.node.slug }}</span>
              <span class="ml-2 text-[11px] rounded bg-gray-100 px-2 py-0.5">товаров: {{ row.node.productCount }}</span>
            </div>
            <button class="text-xs underline" @click.stop="$emit('create-child', row.node.id)">+ Подкатегория</button>
            <button class="text-xs underline" @click.stop="$emit('edit', row.node.id)">Изм.</button>
            <button class="text-xs underline text-red-600" @click.stop="$emit('delete', row.node.id)">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { TreeNode } from '@/stores/categories'

const props = defineProps<{
  tree: TreeNode[]
  expanded: Set<string>
  selectedId: string | null
  search: string
}>()
const emit = defineEmits(['toggle','select','create-root','create-child','expand-all','collapse-all','move','drop-products','edit','delete','update:search'])

const rowHeight = 34
const scrollRef = ref<HTMLElement|null>(null)
const flat = computed(()=>flatten(props.tree, props.expanded))
const totalHeight = computed(()=>flat.value.length * rowHeight)

const state = reactive({ start: 0, end: 0, viewport: 400 })
function onScroll() {
  const el = scrollRef.value!
  state.viewport = el.clientHeight
  const start = Math.floor(el.scrollTop / rowHeight) - 6
  const end = start + Math.ceil(el.clientHeight / rowHeight) + 12
  state.start = Math.max(0, start)
  state.end = Math.min(flat.value.length, end)
}
watch([flat], () => { onScroll() })
function onSearchInput(e: Event) { emit('update:search', (e.target as HTMLInputElement).value) }

const windowRows = computed(() => {
  const arr = []
  for (let i = state.start; i < state.end; i++) {
    const r = { ...flat.value[i], pos: i * rowHeight, isOver: false }
    r.selected = props.selectedId === r.node.id
    arr.push(r)
  }
  return arr
})

function onDragStart(e: DragEvent, id: string) {
  e.dataTransfer?.setData('text/plain', id)
  e.dataTransfer?.setDragImage(new Image(), 0, 0)
}
function onDragOver(e: DragEvent, row: any) {
  const t = e.dataTransfer?.getData('text/plain') || ''
  if (t.startsWith('products:')) row.isOver = true
}
function onDrop(e: DragEvent, row: any) {
  const txt = e.dataTransfer?.getData('text/plain') || ''
  if (txt.startsWith('products:')) {
    const ids = txt.replace('products:','').split(',').filter(Boolean)
    emit('drop-products', { categoryId: row.node.id, ids })
  } else {
    const id = txt
    if (!id || id === row.node.id) return
    emit('move', { id, newParentId: row.node.id })
  }
}
function flatten(tree: TreeNode[], expanded: Set<string>) {
  const out: Array<{ node: TreeNode, level: number, selected: boolean }> = []
  function walk(nodes: TreeNode[], level: number) {
    for (const n of nodes) {
      out.push({ node: n, level, selected: false })
      if (n.children?.length && expanded.has(n.id)) walk(n.children, level+1)
    }
  }
  walk(tree, 0)
  return out
}
</script>

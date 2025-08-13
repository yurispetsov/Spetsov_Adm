<template>
  <li>
    <div
      :style="{ paddingLeft: `${level*14}px` }"
      :class="[
        'node flex items-center gap-2 px-2 py-1 rounded cursor-pointer select-none',
        'level-' + level,
        selectedId === node.id ? 'is-selected' : isOver ? 'is-over' : 'hover:bg-gray-50'
      ]"
      draggable="true"
      @dragstart="onDragStart"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop"
    >
      <button class="w-5 text-center" @click="$emit('toggle', node.id)">
        <span v-if="node.children.length">{{ expanded.has(node.id) ? '▾' : '▸' }}</span>
        <span v-else>·</span>
      </button>

      <div class="flex-1 min-w-0" @click="$emit('select', node.id)">
        <span class="font-medium truncate">{{ node.name }}</span>
        <span class="ml-2 text-xs opacity-60 truncate">/ {{ node.slug }}</span>
        <span class="ml-2 text-[11px] rounded bg-gray-100 px-2 py-0.5">товаров: {{ node.productCount }}</span>
        <span v-if="!node.isVisible" class="ml-2 text-xs text-orange-600">скрыта</span>
      </div>

      <!-- inline actions on hover -->
      <div class="opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1">
        <button class="text-xs underline" @click.stop="$emit('create-child', node.id)">+ Подкатегория</button>
        <button class="text-xs underline" @click.stop="$emit('edit', node.id)">Изм.</button>
        <button class="text-xs underline text-red-600" @click.stop="$emit('delete', node.id)">Удалить</button>
      </div>
    </div>

    <ul v-if="expanded.has(node.id)">
      <CategoryTreeNode
        v-for="c in node.children"
        :key="c.id"
        :node="c"
        :level="level + 1"
        :expanded="expanded"
        :selected-id="selectedId"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
        @create-child="$emit('create-child', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @move="$emit('move', $event)"
        @drop-products="$emit('drop-products', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNode } from '@/stores/categories'

const props = defineProps<{
  node: TreeNode
  level: number
  expanded: Set<string>
  selectedId: string | null
}>()

const emit = defineEmits([
  'toggle','select','create-child','edit','delete','move','drop-products'
])

const isOver = ref(false)

function onDragStart(e: DragEvent) {
  e.dataTransfer?.setData('text/plain', (props.node as any).id)
  e.dataTransfer?.setDragImage(new Image(), 0, 0)
}
function onDragOver(e: DragEvent) {
  const t = e.dataTransfer?.getData('text/plain') || ''
  if (t.startsWith('products:')) isOver.value = true
}
function onDragLeave() { isOver.value = false }
function onDrop(e: DragEvent) {
  const txt = e.dataTransfer?.getData('text/plain') || ''
  if (txt.startsWith('products:')) {
    const ids = txt.replace('products:','').split(',').filter(Boolean)
    emit('drop-products', { categoryId: (props.node as any).id, ids })
  } else {
    const id = txt
    if (!id || id === (props.node as any).id) return
    emit('move', { id, newParentId: (props.node as any).id })
  }
  isOver.value = false
}
</script>

<style scoped>
.node { position: relative; }
.node::before {
  content: "";
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--line, #e5e7eb);
  opacity: .6;
}
.level-0 { --line: #c7d2fe; background: #f8fafc; }
.level-1 { --line: #facc15; background: #fffbeb; }
.level-2 { --line: #34d399; background: #f0fdf4; }
.level-3 { --line: #60a5fa; background: #eff6ff; }
.level-4 { --line: #f472b6; background: #fdf2f8; }
.is-selected { outline: 2px solid #c7d2fe; background: #eef2ff; }
.is-over { background: #ecfdf5; }
</style>

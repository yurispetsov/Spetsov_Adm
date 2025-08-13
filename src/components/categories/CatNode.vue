<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeNode } from '@/shared/types/catalog'

const props = defineProps<{ node: TreeNode }>()
const emit = defineEmits<{
  (e:'rename', id:number, name:string):void
  (e:'add-child', parentId:number, depth:number):void
  (e:'toggle', id:number, visible:boolean):void
  (e:'remove', id:number):void
  (e:'reorder', draggedId:number, targetId:number, makeChild:boolean):void
}>()

const editing = ref(false)
const draft = ref(props.node.name)
const canAddChild = computed(() => props.node.depth < 4)

function doRename(){
  const val = draft.value.trim()
  if (!val) { editing.value=false; return }
  emit('rename', props.node.id, val)
  editing.value=false
}

function onDragStart(ev: DragEvent){
  ev.dataTransfer?.setData('text/plain', String(props.node.id))
  ev.dataTransfer?.setDragImage?.(document.createElement('span'), 0, 0)
}
function onDragOver(ev: DragEvent){ ev.preventDefault() }
function onDrop(ev: DragEvent){
  ev.preventDefault()
  const dragged = Number(ev.dataTransfer?.getData('text/plain') || -1)
  if (!dragged || dragged === props.node.id) return
  const makeChild = !!ev.altKey
  emit('reorder', dragged, props.node.id, makeChild)
}
</script>

<template>
  <div class="py-1">
    <div
      class="flex items-center gap-2 rounded-md hover:bg-gray-50 px-2"
      :style="{ paddingLeft: `${(node.depth - 1) * 20}px` }"
      draggable="true"
      @dragstart="onDragStart"
      @dragover="onDragOver"
      @drop="onDrop"
    >
      <button class="w-6 text-gray-500" @click="node.expanded = !node.expanded" v-if="node.children.length">
        <span v-if="node.expanded">▾</span>
        <span v-else>▸</span>
      </button>
      <span v-else class="w-6"></span>

      <span class="cursor-grab select-none">⋮⋮</span>
      <span class="text-yellow-600">📁</span>

      <template v-if="!editing">
        <span class="truncate font-medium">{{ node.name }}</span>
        <span class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">lvl {{ node.depth }}</span>
        <span v-if="!node.isVisible" class="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">скрыт</span>
        <div class="ml-auto flex items-center gap-2">
          <button class="btn-ghost" @click="editing = true; draft = node.name" title="Переименовать">✏️</button>
          <button class="btn-ghost" @click="$emit('toggle', node.id, !node.isVisible)" title="Показ/скрыть">👁️</button>
          <button class="btn-ghost" @click="$emit('remove', node.id)" title="Удалить">🗑️</button>
          <button class="btn-ghost" :disabled="!canAddChild" @click="$emit('add-child', node.id, node.depth)" title="Добавить подкатегорию">➕</button>
        </div>
      </template>

      <template v-else>
        <input v-model="draft" @keyup.enter="doRename" @blur="doRename" class="px-2 py-1 border rounded w-64" />
      </template>
    </div>

    <div v-show="node.expanded" v-if="node.children.length">
      <CatNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @rename="$emit('rename', $event[0], $event[1])"
        @add-child="$emit('add-child', $event[0], $event[1])"
        @toggle="$emit('toggle', $event[0], $event[1])"
        @remove="$emit('remove', $event)"
        @reorder="$emit('reorder', $event[0], $event[1], $event[2])"
      />
    </div>
  </div>
</template>

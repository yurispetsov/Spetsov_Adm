<script setup lang="ts">
import { ref } from 'vue'
import { type CatalogNode, updateNode } from '@/shared/api/catalog'

const props = defineProps<{
  nodes: (CatalogNode & { children?: any[] })[]
  byId: Record<string, any>
  maxDepth?: number
}>()
const emit = defineEmits<{
  (e:'select', id:string):void
  (e:'add', parentId:string|null, type:'section'|'category'):void
  (e:'refresh'):void
}>()

const expanded = ref<Record<string, boolean>>({})

function toggle(id:string){ expanded.value[id] = !expanded.value[id] }

function canDrop(target:any, draggedId:string){
  if(String(target.id)===String(draggedId)) return false
  let cur = target
  while(cur && cur.parentId){ if(String(cur.parentId)===String(draggedId)) return false; cur = props.byId[cur.parentId] }
  let depth = 1; cur = target; while(cur && cur.parentId){ depth++; cur = props.byId[cur.parentId] }
  return depth < (props.maxDepth || 4)
}
function onDragStart(e:DragEvent, id:string){ e.dataTransfer?.setData('text/plain', String(id)) }
async function onDrop(e:DragEvent, target:any){
  const id = e.dataTransfer?.getData('text/plain'); if(!id) return
  if(!canDrop(target, id)) return
  await updateNode(id, { parentId: target.id })
  emit('refresh')
}
</script>

<template>
  <ul class="space-y-1">
    <li v-for="n in nodes" :key="n.id">
      <div class="row" @dragover.prevent @drop="onDrop($event, n)">
        <button class="w-5 shrink-0 text-gray-500" @click="toggle(n.id)">
          {{ (n.children && n.children.length) ? (expanded[n.id] ? '▾' : '▸') : '' }}
        </button>
        <div class="w-4 shrink-0 cursor-grab text-gray-400" draggable="true" @dragstart="onDragStart($event, n.id)">⋮⋮</div>
        <div class="w-5 shrink-0 text-center" :title="n.type">{{ n.icon || (n.type==='section' ? '🗂️' : '📁') }}</div>
        <button class="text-left flex-1 truncate" @click="$emit('select', n.id)">
          <span class="truncate inline-block">{{ n.name }}</span>
        </button>
        <div class="actions">
          <button class="btn-xs" title="Добавить подкатегорию" @click="$emit('add', n.id, 'category')">＋</button>
        </div>
      </div>
      <div v-if="n.children && n.children.length && expanded[n.id]" class="ml-6">
        <CatalogTree :nodes="n.children" :byId="byId" :maxDepth="maxDepth" @select="$emit('select',$event)" @add="$emit('add',$event[0],$event[1])" @refresh="$emit('refresh')" />
      </div>
    </li>
  </ul>
</template>

<style scoped>
.row{ display:flex; align-items:center; gap:.5rem; padding:.375rem .5rem; border-radius:.5rem; min-height:38px; }
.row:hover{ background:#f9fafb; }
.actions{ display:flex; gap:.25rem; opacity:0; transition:opacity .15s ease; }
.row:hover .actions{ opacity:1; }
.btn-xs{ @apply rounded px-2 py-0.5 text-xs border border-gray-300 bg-white hover:bg-gray-50; }
</style>

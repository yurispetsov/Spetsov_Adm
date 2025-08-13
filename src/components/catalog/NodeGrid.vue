<script setup lang="ts">
import { ref, computed } from 'vue'
import { type CatalogNode, updateNode } from '@/shared/api/catalog'

const props = defineProps<{
  nodes: (CatalogNode & { children?: any[] })[]
}>()
const emit = defineEmits<{ (e:'select', id:string):void, (e:'add'):void, (e:'refresh'):void }>()

const sorted = computed(()=> [...props.nodes].sort((a,b)=> (a.position||0)-(b.position||0) || a.name.localeCompare(b.name)))

const dragging = ref<string|undefined>(undefined)
function onDragStart(e:DragEvent, id:string){ dragging.value = id; e.dataTransfer?.setData('text/plain', id) }
function onDragOver(e:DragEvent){ e.preventDefault() }
async function onDrop(e:DragEvent, targetId:string){
  const id = e.dataTransfer?.getData('text/plain') || dragging.value; if(!id || id===targetId) return
  const list = sorted.value.slice()
  const from = list.findIndex(n=>n.id===id)
  const to = list.findIndex(n=>n.id===targetId)
  if(from<0 || to<0) return
  const [m] = list.splice(from,1); list.splice(to,0,m)
  // reassign positions (simple increasing sequence)
  const patches = list.map((n,i)=> updateNode(n.id, { position: (i+1)*10 }))
  await Promise.all(patches)
  emit('refresh')
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
    <div v-for="n in sorted" :key="n.id" class="card" draggable="true"
         @dragstart="onDragStart($event, n.id)" @dragover="onDragOver" @drop="onDrop($event, n.id)"
         @click="$emit('select', n.id)">
      <div class="font-medium flex items-center gap-2 min-w-0">
        <span class="text-xl shrink-0">{{ n.icon || (n.type==='section'?'🗂️':'📁') }}</span>
        <span class="truncate">{{ n.name }}</span>
      </div>
      <div class="text-xs text-gray-500 mt-1">{{ n.type==='section'?'Раздел':'Категория' }}</div>
    </div>
    <button class="card dashed text-gray-500" @click.stop="$emit('add')">+ Добавить</button>
  </div>
</template>

<style scoped>
.card{ @apply p-3 rounded border hover:border-indigo-300 cursor-pointer min-h-[68px] text-left bg-white; }
.card.dashed{ @apply border-dashed; }
</style>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import UploadDrop from './UploadDrop.vue'

type MediaItem = { id:string; url:string; cover?:boolean; alt?:string; _file?: File }
const props = defineProps<{ modelValue?: MediaItem[] }>() 
const emit = defineEmits<{ (e:'update:modelValue', v:MediaItem[]):void }>()

const items = ref<MediaItem[]>(props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [])

function commit(){ emit('update:modelValue', items.value) }

function onFiles(files: File[]){
  const appended = Array.from(files).map(f => ({
    id: crypto.randomUUID(),
    url: URL.createObjectURL(f), // лёгкий предпросмотр
    _file: f
  }))
  items.value = [...items.value, ...appended]
  if (!items.value.some(i=>i.cover) && items.value.length) items.value[0].cover = True
  commit()
}

// revoke url helpers
function revoke(item: MediaItem){
  try { if (item.url?.startsWith('blob:')) URL.revokeObjectURL(item.url) } catch {}
}

function removeSelected(){
  selectedIds.value.forEach(id => {
    const idx = items.value.findIndex(i=>i.id===id)
    if (idx>-1) { revoke(items.value[idx]); items.value.splice(idx,1) }
  })
  selectedIds.value = []
  commit()
}
function setCover(id:string){ items.value.forEach(i => i.cover = (i.id===id)); commit() }
function onDragStart(e: DragEvent, id:string){ e.dataTransfer?.setData('text/plain', id) }
function onDrop(e: DragEvent, id:string){
  const dragId = e.dataTransfer?.getData('text/plain'); if(!dragId) return
  const src = items.value.findIndex(i=>i.id===dragId)
  const dst = items.value.findIndex(i=>i.id===id)
  const [m] = items.value.splice(src,1)
  items.value.splice(dst,0,m)
  commit()
}
const selectedIds = ref<string[]>([])
function toggleSel(id:string){ const s=new Set(selectedIds.value); s.has(id)?s.delete(id):s.add(id); selectedIds.value=Array.from(s) }
function selectAll(){ selectedIds.value = items.value.map(i=>i.id) }
function clearSel(){ selectedIds.value = [] }

onBeforeUnmount(()=>{ items.value.forEach(revoke) })
</script>

<template>
  <div>
    <UploadDrop class="mb-3" @files="onFiles" />

    <template v-if="items.length">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <button class="link" @click="selectAll">Выбрать все</button>
          <button class="link" @click="clearSel">Снять выделение</button>
        </div>
        <button class="text-red-600 hover:underline text-sm" @click="removeSelected">Удалить медиа</button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div v-for="m in items" :key="m.id"
             class="relative border rounded-lg overflow-hidden bg-white"
             draggable="true" @dragstart="onDragStart($event, m.id)" @dragover.prevent @drop="onDrop($event, m.id)">
          <img :src="m.url" alt="" class="w-full h-36 object-cover" loading="lazy" />
          <div class="absolute top-1 left-1">
            <input type="checkbox" :checked="selectedIds.includes(m.id)" @change="toggleSel(m.id)" />
          </div>
          <div class="absolute top-1 right-1 flex gap-1">
            <button class="px-1.5 py-1 rounded bg-white/80 border" title="Сделать обложкой" @click="setCover(m.id)">★</button>
          </div>
          <div v-if="m.cover" class="absolute bottom-1 left-1 text-xs bg-white/80 px-1 rounded">Обложка</div>
        </div>
      </div>
    </template>

    <div v-else class="text-sm text-gray-500">Перетащите файлы сюда или нажмите «Добавить файлы».</div>
  </div>
</template>

<style scoped>
.link{ @apply text-indigo-600 hover:underline text-sm; }
</style>

<template>
  <div>
    <div
      class="rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center cursor-pointer hover:bg-gray-50"
      @click="open"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <div v-if="files.length===0" class="text-sm text-gray-600">
        <div class="font-medium text-indigo-600">Добавить файлы</div>
        <div class="text-xs text-gray-500">Перетащите сюда или нажмите, поддерживается .jpg, .png, .gif</div>
      </div>
      <input ref="input" type="file" class="hidden" accept="image/*" multiple @change="onSelect" />
      <div v-if="files.length>0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div v-for="(f, idx) in files" :key="f.id"
          class="relative rounded-lg overflow-hidden border-2"
          :class="f.isPrimary ? 'border-indigo-400' : 'border-transparent'"
          draggable="true"
          @dragstart="onDragStart(idx)"
          @dragover.prevent
          @drop="onDropReorder(idx)"
        >
          <img :src="f.url" class="block w-full h-32 object-cover" />
          <div class="absolute top-1 right-1 flex gap-1">
            <button class="px-2 py-1 text-xs rounded bg-white/90 border" title="Сделать главным" @click.stop="makePrimary(idx)">★</button>
            <button class="px-2 py-1 text-xs rounded bg-white/90 border" title="Удалить" @click.stop="remove(idx)">✕</button>
          </div>
          <div class="absolute bottom-1 left-1">
            <div class="px-1.5 py-0.5 text-[11px] rounded bg-white/90 border">⋮⋮</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

type MediaItem = { id: string; url: string; isPrimary?: boolean; name?: string; }
const props = defineProps<{ modelValue: MediaItem[] }>()
const emit = defineEmits<{ (e:'update:modelValue', v:MediaItem[]): void }>()

const input = ref<HTMLInputElement|null>(null)
const files = ref<MediaItem[]>(props.modelValue || [])

watch(()=>props.modelValue, (v)=>{ files.value = v ? [...v] : [] })

function open(){ input.value?.click() }

function onSelect(e: Event){
  const list = (e.target as HTMLInputElement).files
  if (!list) return
  for (const file of Array.from(list)){
    const reader = new FileReader()
    reader.onload = ()=>{
      files.value.push({ id: crypto.randomUUID(), url: String(reader.result), name: file.name })
      emit('update:modelValue', files.value)
    }
    reader.readAsDataURL(file)
  }
  ;(e.target as HTMLInputElement).value = ''
}
function onDrop(e: DragEvent){
  const list = e.dataTransfer?.files
  if (!list) return
  for (const file of Array.from(list)){
    const reader = new FileReader()
    reader.onload = ()=>{
      files.value.push({ id: crypto.randomUUID(), url: String(reader.result), name: file.name })
      emit('update:modelValue', files.value)
    }
    reader.readAsDataURL(file)
  }
}
let dragIndex = -1
function onDragStart(i:number){ dragIndex = i }
function onDropReorder(i:number){
  if (dragIndex===-1 || dragIndex===i) return
  const arr = [...files.value]
  const [m] = arr.splice(dragIndex,1)
  arr.splice(i,0,m)
  files.value = arr
  dragIndex = -1
  emit('update:modelValue', files.value)
}

function makePrimary(i:number){
  files.value = files.value.map((x, idx)=> ({ ...x, isPrimary: idx===i }))
  emit('update:modelValue', files.value)
}
function remove(i:number){
  files.value.splice(i,1)
  emit('update:modelValue', files.value)
}
</script>

<template>
  <dialog ref="dlg" class="rounded-xl p-0 w-[640px] max-w-[96vw]">
    <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
      <div class="font-medium">Переместить в категорию</div>
      <button class="opacity-70" @click="close">✕</button>
    </div>
    <div class="p-4">
      <input v-model="q" class="border rounded px-3 py-2 w-full mb-3" placeholder="Поиск по категориям..." />
      <ul class="max-h-[50vh] overflow-auto space-y-1">
        <li v-for="c in filtered" :key="c.id">
          <button class="w-full text-left px-3 py-1 rounded hover:bg-gray-100" @click="choose(c.id)">
            {{ c.path }}
          </button>
        </li>
      </ul>
    </div>
    <div class="p-3 border-t text-right">
      <button class="border rounded px-3 py-2" @click="close">Отмена</button>
    </div>
  </dialog>
</template>
<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useCategoriesStore } from '@/stores/categories'

const emit = defineEmits(['pick','close'])
const dlg = ref<HTMLDialogElement|null>(null)
const q = ref('')
const store = useCategoriesStore()

const flat = computed(()=>{
  const res: any[] = []
  function walk(list:any[], prefix:string[]=[]){
    list.forEach(n=>{
      const path = [...prefix, n.name]
      res.push({ id: n.id, path: path.join(' / ') })
      if (n.children?.length) walk(n.children, path)
    })
  }
  walk((store as any).tree || [])
  return res
})
const filtered = computed(()=>{
  const v = q.value.toLowerCase()
  return !v ? flat.value : flat.value.filter(x => x.path.toLowerCase().includes(v))
})

async function open(){ await nextTick(); dlg.value?.showModal() }
function close(){ dlg.value?.close(); emit('close') }
function choose(id: string){ emit('pick', id); close() }

defineExpose({ open, close })
</script>
<style>
dialog::backdrop { background: rgba(0,0,0,.25) }
dialog { border: 1px solid #eee }
</style>

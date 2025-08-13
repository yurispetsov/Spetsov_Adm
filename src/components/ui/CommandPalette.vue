<template>
  <dialog ref="dlg" class="rounded-xl p-0 w-[680px] max-w-[96vw]">
    <div class="p-3 border-b font-medium">Команды (Ctrl+K)</div>
    <div class="p-3">
      <input ref="inputRef" v-model="q" @keydown.enter.prevent="run(first)"
             placeholder="Напишите команду, например: создать категорию, переместить в..."
             class="w-full border rounded px-3 py-2"/>
    </div>
    <ul class="max-h-[50vh] overflow-auto">
      <li v-for="c in filtered" :key="c.id"
          class="px-3 py-2 hover:bg-gray-50 cursor-pointer"
          @click="run(c)">
        <div class="font-medium">{{ c.title }}</div>
        <div class="text-xs opacity-70">{{ c.hint }}</div>
      </li>
      <li v-if="!filtered.length" class="px-3 py-2 text-sm opacity-60">Ничего не найдено</li>
    </ul>
  </dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

const emit = defineEmits(['exec'])
const q = ref('')
const inputRef = ref<HTMLInputElement|null>(null)
const cmds = [
  { id: 'newRoot', title: 'Создать корневую категорию', hint: 'Ctrl+N' },
  { id: 'newChild', title: 'Создать подкатегорию', hint: 'В текущей' },
  { id: 'rename', title: 'Переименовать выбранную', hint: 'F2' },
  { id: 'delete', title: 'Удалить выбранную', hint: 'Del' },
  { id: 'expandAll', title: 'Развернуть всё', hint: '' },
  { id: 'collapseAll', title: 'Свернуть всё', hint: '' },
]

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return cmds
  return cmds.filter(c => c.title.toLowerCase().includes(s))
})
const first = computed(() => filtered.value[0])

function open() {
  (dlg.value as HTMLDialogElement).showModal()
  q.value = ''
  nextTick(()=>inputRef.value?.focus())
}
function close() { (dlg.value as HTMLDialogElement).close() }
function run(c: any) {
  if (!c) return
  emit('exec', c.id)
  close()
}
const dlg = ref<HTMLDialogElement|null>(null)
defineExpose({ open, close })
</script>
<style>
dialog::backdrop { background: rgba(0,0,0,.2) }
dialog { border: 1px solid #eee }
</style>

<template>
  <aside class="w-[300px] shrink-0 border-r bg-white">
    <div class="p-3">
      <div class="flex items-center justify-between mb-2">
        <div class="text-sm font-semibold">Разделы</div>
        <button class="text-sm text-indigo-600 hover:underline" @click="$emit('add-root')" title="Добавить корневой раздел">+ Добавить</button>
      </div>
      <div class="relative">
        <input v-model="q" class="input w-full" placeholder="Поиск…" />
        <button v-if="q" class="absolute right-2 top-2 text-gray-400" @click="q=''" title="Очистить">✕</button>
      </div>
    </div>

    <ul class="px-2 pb-3 space-y-1 overflow-auto max-h-[calc(100vh-140px)]">
      <li v-for="c in filtered" :key="c.id">
        <div
          class="w-full grid grid-cols-[1fr_auto] items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50"
          :class="c.id===modelValue ? 'ring-2 ring-indigo-500' : ''"
        >
          <!-- Title area -->
          <button
            class="flex items-center gap-2 min-w-0 px-1 py-1 rounded hover:bg-gray-50 text-left"
            @click="$emit('update:modelValue', c.id)"
            title="Выбрать раздел"
            aria-label="Выбрать раздел"
          >
            <span class="w-5 h-5 grid place-items-center flex-none">{{ c.icon || '📁' }}</span>
            <span class="truncate block">{{ c.name }}</span>
          </button>

          <!-- Actions -->
          <div class="flex items-center gap-1.5 justify-end">
            <button class="action" title="Переименовать" aria-label="Переименовать" @click="$emit('rename-root', c.id)">✎</button>
            <button class="action" title="Изменить иконку" aria-label="Изменить иконку" @click="$emit('edit-root', c.id)">★</button>
            <button class="action" title="Удалить" aria-label="Удалить" @click="$emit('delete-root', c.id)">🗑️</button>
          </div>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
type Root = { id:string; name:string; icon?: string }
const props = defineProps<{ items: Root[]; modelValue: string|null }>()
defineEmits<{
  (e:'update:modelValue', v:string|null): void,
  (e:'add-root'): void,
  (e:'rename-root', id:string): void,
  (e:'edit-root', id:string): void,
  (e:'delete-root', id:string): void
}>()

const q = ref('')
const filtered = computed(()=>{
  const arr = props.items || []
  if (!q.value.trim()) return arr
  const s = q.value.toLowerCase()
  return arr.filter(i => i.name.toLowerCase().includes(s))
})

const modelValue = computed(()=> props.modelValue)
</script>

<style scoped>
.input{ @apply rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500; }
.action{
  @apply inline-flex items-center justify-center h-7 w-7 text-xs border border-gray-300 rounded-md bg-white hover:bg-gray-50;
}
</style>

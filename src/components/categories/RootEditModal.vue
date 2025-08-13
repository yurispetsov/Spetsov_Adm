<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="w-full max-w-xl rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b">
          <h3 class="text-lg font-semibold">Настройки раздела</h3>
          <button class="px-2 py-1 text-gray-500 hover:text-gray-900" @click="$emit('close')">✕</button>
        </div>
        <div class="p-4 space-y-4">
          <label class="block">
            <div class="mb-1 text-sm">Название</div>
            <input v-model="local.name" class="input" placeholder="Название раздела" />
          </label>

          <div>
            <div class="mb-1 text-sm">Иконка</div>
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 grid place-items-center rounded border text-lg bg-white">{{ local.icon || '📁' }}</div>
              <input v-model="local.icon" class="input" placeholder="Любой символ/эмодзи" />
            </div>
            <div class="mt-2 text-xs text-gray-500">Можно вставить любое эмодзи (например, 🛠️ 💡 🔧), или оставить пустым.</div>
          </div>

          <div>
            <div class="text-xs text-gray-500 mb-1">Быстрый выбор</div>
            <div class="flex flex-wrap gap-2">
              <button v-for="e in presets" :key="e" class="emoji" @click="local.icon=e">{{ e }}</button>
            </div>
          </div>
        </div>
        <div class="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2">
          <button class="btn" @click="$emit('close')">Отмена</button>
          <button class="btn" @click="save">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
const props = defineProps<{ open:boolean; model?: { id:string; name:string; icon?:string }|null }>()
const emit = defineEmits<{ (e:'close'): void, (e:'submit', payload:{ name:string; icon?:string|null }): void }>()

const local = reactive({ name:'', icon:'' as string|undefined })
watch(()=>props.model, (m)=>{
  local.name = m?.name || ''
  local.icon = m?.icon || ''
}, { immediate:true })

const presets = ['🛠️','💡','🔧','⚙️','🧰','🪛','🔩','📦','🏷️','📁']

function save(){
  emit('submit', { name: local.name.trim(), icon: local.icon?.trim() || '' })
}
</script>

<style scoped>
.input{ @apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500; }
.btn{ @apply inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50; }
.emoji{ @apply text-xl px-2 py-1 border rounded hover:bg-gray-50; }
</style>

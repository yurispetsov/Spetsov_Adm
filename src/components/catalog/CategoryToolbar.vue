<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  busy?: boolean
}>()
const emit = defineEmits<{
  (e:'update:modelValue', v:string): void
  (e:'add-root'): void
  (e:'export'): void
  (e:'import', file: File): void
}>()

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) emit('import', f)
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
    <input
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      placeholder="Поиск по категориям..."
      class="flex-1 min-w-[220px] px-3 py-2 border rounded-lg outline-none focus:ring w-full"
      type="text"
    />
    <button :disabled="busy" @click="$emit('add-root')" class="btn btn-primary px-4 py-2 rounded-lg disabled:opacity-50">
      + Корневой раздел
    </button>

    <button class="btn btn-ghost px-3 py-2 rounded-lg border" @click="$emit('export')">
      Экспорт JSON
    </button>

    <label class="btn btn-ghost px-3 py-2 rounded-lg border cursor-pointer">
      Импорт JSON
      <input type="file" accept="application/json" class="hidden" @change="onFile">
    </label>
  </div>
</template>

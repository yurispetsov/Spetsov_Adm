<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  busy?: boolean
}>()
const emit = defineEmits<{
  (e:'update:modelValue', v:string): void
  (e:'add-root'): void
}>()
</script>

<template>
  <div class="card p-3 flex flex-wrap items-center gap-3">
    <input
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      placeholder="Поиск по категориям…"
      class="input flex-1 min-w-[220px]"
      type="text"
    />
    <button :disabled="busy" @click="$emit('add-root')" class="btn btn-primary px-4 py-2 rounded-lg">
      + Корневой раздел
    </button>
    <div class="text-xs text-gray-500 ml-auto">
      DnD: перетащите для сортировки; Alt+Drop — сделать потомком
    </div>
  </div>
</template>

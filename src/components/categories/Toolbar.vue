<script setup lang="ts">
const props = defineProps<{ query?: string, showHidden?: boolean }>()
const emit = defineEmits(['update:query','update:showHidden','add-root'])
</script>

<template>
  <div class="w-full px-4 py-2 flex items-center gap-2">
    <button class="btn btn-primary" @click="$emit('add-root')">+ Категория</button>
    <div class="flex-1"></div>
    <input class="input" type="search" placeholder="Поиск…" :value="props.query" @input="$emit('update:query', ($event.target as HTMLInputElement).value)" />
    <label class="flex items-center gap-2 text-sm"><input type="checkbox" :checked="props.showHidden" @change="$emit('update:showHidden', ($event.target as HTMLInputElement).checked)" /> Скрытые</label>
  </div>
</template>

<style scoped>
.btn{ @apply px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700; }
.input{ @apply border rounded px-3 py-1.5 w-64; }
</style>
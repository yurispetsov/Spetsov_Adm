<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold">{{ title }}</h2>
        <p class="text-xs text-gray-500" v-if="hint">{{ hint }}</p>
      </div>
      <div class="flex gap-2">
        <button class="btn" @click="$emit('add-child')">+ Подкатегория</button>
        <button class="btn" :disabled="!selectedId" @click="$emit('rename')">Переименовать</button>
        <button class="btn" :disabled="!selectedId" @click="$emit('delete')">Удалить</button>
      </div>
    </div>

    <div v-if="items.length===0" class="text-sm text-gray-600">Здесь пока пусто. Создайте первую подкатегорию.</div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div v-for="c in items" :key="c.id"
        class="rounded-lg border p-3 bg-white hover:shadow-sm cursor-pointer group relative"
        :class="c.id===selectedId ? 'ring-2 ring-indigo-500' : ''"
        @click="$emit('select', c.id)"
        draggable="true"
        @dragstart="onDragStart(c.id)"
        @dragover.prevent
        @drop="onDrop(c.id)"
        title="Перетащи на плитку, чтобы сменить родителя"
      >
        <div class="font-medium truncate">{{ c.name }}</div>
        <div class="text-xs text-gray-500">{{ c.count ?? 0 }} товаров</div>
        <button class="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-xs px-2 py-1 border rounded bg-white" @click.stop="$emit('edit', c.id)">Открыть</button>
      </div>
      <div class="rounded-lg border-2 border-dashed p-3 grid place-items-center text-sm text-gray-500 cursor-pointer hover:bg-gray-50" @click="$emit('add-child')">+ Добавить</div>
    </div>
  </div>
</template>

<script setup lang="ts">
let dragId: string|null = null
defineProps<{ items: any[]; title: string; hint?: string; selectedId?: string|null }>()
defineEmits<{ (e:'select', id:string): void, (e:'edit', id:string): void, (e:'add-child'): void, (e:'rename'): void, (e:'delete'): void, (e:'move', payload:{ id:string, to:string }): void }>()

function onDragStart(id: string){ dragId = id }
function onDrop(to: string){ if (dragId && dragId !== to) emit('move', { id: dragId, to }) ; dragId = null }
</script>

<style scoped>
.btn{ @apply inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-gray-300 hover:bg-gray-50; }
</style>

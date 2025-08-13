<template>
  <div class="flex flex-wrap items-center gap-2 p-2 border-b bg-white sticky top-0 z-10">
    <button v-for="c in cols" :key="c.id" class="px-3 py-1 rounded-full border text-sm hover:bg-gray-50"
            :class="active===c.id ? 'bg-black text-white' : ''"
            @click="apply(c)">{{ c.label }}</button>
    <button class="ml-auto px-2 py-1 text-xs rounded border" @click="$emit('clear')">Сбросить</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['apply','clear'])
const props = defineProps<{ active?: string|null }>()

const cols = [
  { id: 'uncat', label: 'Без категории', filter: { categoryIds: [] } },
  { id: 'new', label: 'Новинки 30 дней', filter: { createdAtDays: 30 } },
  { id: 'nodoc', label: 'Без документов', filter: { hasDoc: false } },
  { id: 'active', label: 'Активные', filter: { status: ['active'] } },
  { id: 'draft', label: 'Черновики', filter: { status: ['draft'] } },
]
function apply(c: any){ emit('apply', c) }
</script>

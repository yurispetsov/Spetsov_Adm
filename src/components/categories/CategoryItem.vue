<template>
  <li>
    <div
      class="flex items-center gap-2 px-2 py-1 rounded cursor-pointer"
      :class="selectedId === node.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'"
      @click.stop="$emit('select', node.id)"
    >
      <button class="w-5 text-gray-400 hover:text-gray-600" @click.stop="open=!open">{{ open ? '▾' : '▸' }}</button>
      <span class="text-sm flex-1 truncate">{{ node.name }}</span>
      <button class="text-xs px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200" @click.stop="$emit('add-child', node.id)">+</button>
      <button class="text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100" @click.stop="$emit('remove', node.id)">×</button>
    </div>
    <ul v-show="open" class="pl-6">
      <CategoryItem
        v-for="c in node.children"
        :key="c.id"
        :node="c"
        :selected-id="selectedId"
        @select="$emit('select', $event)"
        @add-child="$emit('add-child', $event)"
        @remove="$emit('remove', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { CategoryNode } from '@/shared/types/catalog';

defineProps<{
  node: CategoryNode;
  selectedId: string | null;
}>();

defineEmits(['select','add-child','remove']);

const open = ref(true);
</script>

<template>
  <div :style="{ paddingLeft: `${level * 12}px` }" class="py-1 flex items-center gap-2">
    <button class="text-xs opacity-60" @click="open = !open">{{ open ? '▾' : (hasChildren ? '▸' : '•') }}</button>
    <span :class="['cursor-pointer', selected ? 'font-semibold' : '']" @click="$emit('select', node.id)">{{ node.name }}</span>
    <span class="ml-auto flex gap-2 text-xs opacity-70">
      <button @click="$emit('create-child', node.id)">+ Подкатегория</button>
      <button @click="$emit('edit', node.id)">Изм.</button>
      <button class="text-red-600" @click="$emit('remove', node.id)">Удал.</button>
    </span>
  </div>
  <div v-if="open && children?.length">
    <CategoryTreeNode
      v-for="c in children"
      :key="c.node.id"
      :node="c.node"
      :children="c.children"
      :level="level + 1"
      @select="$emit('select', $event)"
      @create-child="$emit('create-child', $event)"
      @edit="$emit('edit', $event)"
      @remove="$emit('remove', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Category } from '@/types/catalog';

const props = defineProps<{ node: Category; children?: any[]; level: number; selectedId?: string }>();
defineEmits(['select','create-child','edit','remove']);
const open = ref(true);
const hasChildren = computed(()=> (props.children?.length || 0) > 0);
const selected = computed(()=> props.selectedId === props.node.id);
</script>

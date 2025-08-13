<template>
  <div>
    <CategoryTreeNode
      v-for="n in tree"
      :key="n.node.id"
      :node="n.node"
      :children="n.children"
      :level="0"
      @select="$emit('select', $event)"
      @create-child="$emit('create-child', $event)"
      @edit="$emit('edit', $event)"
      @remove="$emit('remove', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from '@/types/catalog';
import CategoryTreeNode from './CategoryTreeNode.vue';

defineProps<{ tree: any[] }>();
defineEmits<{
  (e: 'select', id: string): void;
  (e: 'create-child', parentId: string): void;
  (e: 'edit', id: string): void;
  (e: 'remove', id: string): void;
}>();
</script>

<script setup lang="ts">
import TreeNode from './TreeNode.vue'
import type { TreeNode as TNode } from '@/shared/lib/tree'

defineProps<{
  tree: TNode[],
  selectedId: number|null
}>()

const emit = defineEmits(['select','add-child','rename','remove','move'])
</script>

<template>
  <div class="tree">
    <TreeNode v-for="n in tree" :key="n.id"
      :node="n" :selected-id="selectedId"
      @select="$emit('select',$event)"
      @add-child="$emit('add-child',$event)"
      @rename="$emit('rename',...$event)"
      @remove="$emit('remove',$event)"
      @move="$emit('move',...$event)"
    />
  </div>
</template>
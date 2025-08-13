<script setup lang="ts">
import type { TreeNode } from '@/shared/types/catalog'
import CatNode from './CatNode.vue'

defineProps<{ tree: TreeNode[] }>()

const emit = defineEmits<{
  (e:'rename', id:number, name:string):void
  (e:'add-child', parentId:number, depth:number):void
  (e:'toggle', id:number, visible:boolean):void
  (e:'remove', id:number):void
  (e:'reorder', draggedId:number, targetId:number, makeChild:boolean):void
}>()
</script>

<template>
  <div class="card p-2">
    <CatNode
      v-for="n in tree"
      :key="n.id"
      :node="n"
      @rename="$emit('rename', $event[0], $event[1])"
      @add-child="$emit('add-child', $event[0], $event[1])"
      @toggle="$emit('toggle', $event[0], $event[1])"
      @remove="$emit('remove', $event)"
      @reorder="$emit('reorder', $event[0], $event[1], $event[2])"
    />
    <div v-if="!tree.length" class="p-6 text-center text-gray-500">
      Категорий пока нет. Добавьте первый корневой раздел.
    </div>
  </div>
</template>

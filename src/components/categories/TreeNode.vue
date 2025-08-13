<template>
  <div class="pl-2">
    <div class="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50 cursor-pointer"
         @click="onClick"
         @dragover.prevent
         @drop="onDrop">
      <span class="opacity-50">{{ level ? '•' : '▸' }}</span>
      <span class="truncate">{{ node.name }}</span>
    </div>
    <div v-if="node.children?.length" class="pl-4">
      <TreeNode v-for="c in node.children" :key="c.id" :node="c" :level="level+1" :onSelect="onSelect" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { moveProductsToCategory } from '@/api/products'

const props = defineProps<{ node: any, level: number, onSelect: (id:string)=>void }>()

function onClick(){ props.onSelect(props.node.id) }

function onDrop(e: DragEvent){
  const dt = e.dataTransfer
  if (!dt) return
  const raw = dt.getData('application/x-products')
  if (!raw) return
  const ids = JSON.parse(raw) as string[]
  if (!ids.length) return
  if (!confirm(`Переместить ${ids.length} товаров в «${props.node.name}»?`)) return
  moveProductsToCategory(ids, props.node.id)
}
</script>

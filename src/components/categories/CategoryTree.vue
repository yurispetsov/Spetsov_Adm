<template>
  <div class="h-full flex flex-col">
    <div class="flex gap-2 items-center p-2 border-b bg-white sticky top-0 z-10">
      <input
        :value="search"
        @input="onSearchInput($event)"
        placeholder="Поиск по имени или слагу"
        class="border rounded px-3 py-2 flex-1 min-w-[160px]" />
      <button class="border rounded px-3 py-2" @click="emit('expand-all')">Развернуть</button>
      <button class="border rounded px-3 py-2" @click="emit('collapse-all')">Свернуть</button>
      <button class="border rounded px-3 py-2" @click="emit('create-root')">+ Корневая</button>
    </div>

    <ul class="p-2 space-y-1 overflow-auto tree">
      <CategoryTreeNode
        v-for="n in tree"
        :key="n.id"
        :node="n"
        :level="0"
        :expanded="expanded"
        :selected-id="selectedId"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
        @create-child="emit('create-child', $event)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
        @move="(payload)=>emit('move', payload)"
        @drop-products="(payload)=>emit('drop-products', payload)"
      />
      <li v-if="!tree.length" class="text-sm opacity-60 p-3">Ничего не найдено</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { TreeNode } from '@/stores/categories'
import CategoryTreeNode from './CategoryTreeNode.vue'

const props = defineProps<{
  tree: TreeNode[]
  expanded: Set<string>
  selectedId: string | null
  search: string
}>()

const emit = defineEmits(['toggle','select','create-root','create-child','expand-all','collapse-all','move','drop-products','edit','delete','update:search'])

function onSearchInput(e: Event) {
  emit('update:search', (e.target as HTMLInputElement).value)
}
</script>

<style scoped>
.tree, .tree ul { position: relative; padding-left: 0.75rem; }
.tree ul::before {
  content: "";
  position: absolute;
  left: 8px; top: 0; bottom: 0;
  border-left: 1px dashed #e5e7eb;
}
.tree li { list-style: none; position: relative; }
.tree li::before {
  content: "";
  position: absolute;
  left: 8px; top: 1rem; width: 12px;
  border-top: 1px dashed #e5e7eb;
}
</style>

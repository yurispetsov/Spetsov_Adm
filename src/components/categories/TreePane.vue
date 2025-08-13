<template>
  <div class="flex h-full">
    <!-- Левая панель -->
    <aside class="w-80 min-w-72 border-r bg-white">
      <div class="p-2 flex gap-2 items-center border-b">
        <button
          class="px-2 py-1 text-sm rounded bg-primary-600 text-white hover:bg-primary-700"
          @click="$emit('add-root')"
        >
          + Корневая категория
        </button>

        <div class="ml-auto relative flex-1">
          <input
            v-model="query"
            type="text"
            class="w-full rounded border px-2 py-1 text-sm"
            placeholder="Поиск…"
          />
          <button
            v-if="query"
            class="absolute right-1 top-1 px-1 text-gray-400 hover:text-gray-600"
            @click="query = ''"
            aria-label="Очистить"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="p-2 overflow-auto h-[calc(100%-42px)]">
        <div v-if="loading" class="text-xs text-gray-500">Загрузка…</div>

        <ul v-else class="space-y-1">
          <TreeNode
            v-for="n in filteredTree"
            :key="n.id"
            :node="n"
            :selected-id="selectedId"
            @select="$emit('select', $event)"
            @add-child="$emit('add-child', $event)"
            @remove="$emit('remove', $event)"
          />
        </ul>

        <div v-if="!loading && filteredTree.length === 0" class="text-xs text-gray-400">
          Ничего не найдено
        </div>
      </div>
    </aside>

    <!-- Правая область под форму/таблицу -->
    <section class="flex-1">
      <slot />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TreeNode from './TreeNode.vue'

export type CategoryNode = {
  id: string
  name: string
  count?: number
  hidden?: boolean
  children?: CategoryNode[]
}

const props = defineProps<{
  tree: CategoryNode[]
  selectedId: string | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-root'): void
  (e: 'add-child', id: string): void
  (e: 'select', id: string): void
  (e: 'remove', id: string): void
}>()

const query = ref('')

function filterTree(nodes: CategoryNode[], q: string): CategoryNode[] {
  if (!q.trim()) return nodes
  const ql = q.trim().toLowerCase()

  const walk = (list: CategoryNode[]): CategoryNode[] => {
    const out: CategoryNode[] = []
    for (const n of list) {
      const selfHit = n.name.toLowerCase().includes(ql)
      const kids = n.children ? walk(n.children) : []
      if (selfHit || kids.length) out.push({ ...n, children: kids })
    }
    return out
  }

  return walk(nodes)
}

const filteredTree = computed(() => filterTree(props.tree, query.value))
</script>

<style scoped>
:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 1px;
}
</style>

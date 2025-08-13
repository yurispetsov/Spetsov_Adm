<script setup lang="ts">
import { useNotifyStore } from '@/stores/notify'
const n = useNotifyStore()
</script>

<template>
  <div class="fixed right-4 top-4 z-50 space-y-2">
    <div v-for="t in n.toasts" :key="t.id" class="px-4 py-2 rounded-md shadow card"
         :class="t.type === 'error' ? 'border-red-300' : t.type === 'success' ? 'border-green-300' : 'border-gray-200'">
      <div class="text-sm" :class="t.type === 'error' ? 'text-red-700' : t.type === 'success' ? 'text-green-700' : 'text-gray-700'">
        {{ t.message }}
      </div>
    </div>
  </div>
</template>

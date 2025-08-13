<script setup lang="ts">
defineProps<{ title: string; value: string | number; sub?: string; trend?: number; danger?: boolean }>()
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div class="text-sm text-gray-500 mb-1">{{ title }}</div>
    <div class="text-2xl font-semibold">{{ value }}</div>
    <div v-if="sub" class="text-xs text-gray-500 mt-1">{{ sub }}</div>
    <div v-if="trend !== undefined" class="text-xs mt-2" :class="trend >= 0 ? 'text-green-600' : 'text-red-600'">
      <span v-if="trend >= 0">▲</span><span v-else>▼</span>
      {{ Math.abs(trend).toFixed(1) }}% к предыдущему периоду
    </div>
  </div>
</template>

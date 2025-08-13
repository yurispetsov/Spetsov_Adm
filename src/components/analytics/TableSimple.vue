<script setup lang="ts">
defineProps<{ rows: { title: string; value?: string|number; sub?: string }[], title?: string }>()

</script>
<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div v-if="title" class="text-sm text-gray-500 mb-2">{{ title }}</div>
    <div class="divide-y">
      <div v-for="(r,i) in rows" :key="i" class="py-2 flex items-center justify-between gap-4">
        <div>
          <div class="font-medium">{{ r.title }}</div>
          <div v-if="r.sub" class="text-xs text-gray-500">{{ r.sub }}</div>
        </div>
        <div class="text-right text-gray-700">{{ r.value }}</div>
      </div>
    </div>
  </div>
</template>

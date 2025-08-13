<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="w-full max-w-2xl rounded-xl bg-white shadow-xl border border-gray-200">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 class="text-lg font-semibold">{{ title }}</h3>
          <button class="px-2 py-1 text-gray-500 hover:text-gray-900" @click="$emit('close')">✕</button>
        </div>
        <div class="p-4">
          <slot />
        </div>
        <div v-if="$slots.footer" class="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ open: boolean; title?: string }>()
defineEmits<{ (e:'close'): void }>()
</script>

<template>
  <div v-if="message" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
    <div class="bg-black text-white text-sm px-4 py-2 rounded shadow-lg">
      {{ message }}
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{ message: string | null }>()
</script>

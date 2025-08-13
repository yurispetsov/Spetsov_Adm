<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import Toaster from '@/shared/ui/Toaster.vue'
</script>

<template>
  <div class="min-h-screen grid grid-cols-[240px_1fr] bg-gray-50 text-gray-900">
    <Sidebar />
    <div class="flex flex-col relative">
      <Topbar />
      <main class="p-6">
        <RouterView />
      </main>
      <Toaster />
    </div>
  </div>
</template>

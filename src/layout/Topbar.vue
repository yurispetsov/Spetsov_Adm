<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<template>
  <header class="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
    <div class="font-medium">Панель администратора</div>
    <div class="flex items-center gap-3">
      <span class="text-sm text-gray-600" v-if="auth.user">{{ auth.user.email }}</span>
      <button class="btn" @click="auth.logout()">Выйти</button>
    </div>
  </header>
</template>

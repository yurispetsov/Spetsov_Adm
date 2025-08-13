<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

async function submit() {
  await auth.login(email.value, password.value)
  const redirect = (route.query.redirect as string) || '/'
  router.replace(redirect)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-gray-50">
    <form class="w-full max-w-sm space-y-4 card p-6" @submit.prevent="submit">
      <h1 class="text-2xl font-semibold">Вход в админку</h1>
      <input v-model="email" type="email" placeholder="Email" class="input" required />
      <input v-model="password" type="password" placeholder="Пароль" class="input" required />
      <button class="btn w-full" :disabled="auth.loading">{{ auth.loading ? 'Вход...' : 'Войти' }}</button>
    </form>
  </div>
</template>

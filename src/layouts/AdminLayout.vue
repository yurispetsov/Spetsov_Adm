<template>
  <div class="min-h-screen grid grid-cols-[240px,1fr]">
    <!-- Sidebar -->
    <aside class="border-r bg-white">
      <div class="p-4 text-xs tracking-widest text-gray-500">SHOP ADMIN</div>

      <nav class="px-2 space-y-1">
        <RouterLink v-if="can('dashboard','read')" :to="{ name: 'Dashboard' }" class="block px-3 py-2 rounded hover:bg-gray-100" :class="isActive('Dashboard')">Дашборд</RouterLink>
        <RouterLink v-if="can('products','read')"  :to="{ name: 'Products' }"  class="block px-3 py-2 rounded hover:bg-gray-100" :class="isActive('Products')">Товары</RouterLink>
        <RouterLink v-if="can('categories','read')" :to="{ name: 'Categories' }" class="block px-3 py-2 rounded hover:bg-gray-100" :class="isActive('Categories')">Категории</RouterLink>
        <RouterLink v-if="can('clients','read')" :to="{ name: 'Clients' }" class="block px-3 py-2 rounded hover:bg-gray-100" :class="isActive('Clients')">Клиенты</RouterLink>
        <RouterLink v-if="can('orders','read')"  :to="{ name: 'Orders' }"  class="block px-3 py-2 rounded hover:bg-gray-100" :class="isActive('Orders')">Заказы</RouterLink>
        <RouterLink v-if="can('discounts','read')" :to="{ name: 'Discounts' }" class="block px-3 py-2 rounded hover:bg-gray-100" :class="isActive('Discounts')">Скидки/Цены</RouterLink>
        <RouterLink v-if="can('users','read')"  :to="{ name: 'Users' }"  class="block px-3 py-2 rounded hover:bg-gray-100" :class="isActive('Users')">Пользователи/Роли</RouterLink>
        <RouterLink v-if="can('settings','read')" :to="{ name: 'Settings' }" class="block px-3 py-2 rounded hover:bg-gray-100" :class="isActive('Settings')">Настройки</RouterLink>
      </nav>

      <div class="p-4 mt-4 text-sm border-t">
        <div class="mb-2 text-gray-600">{{ userEmail }}</div>
        <div class="space-y-2">
          <button class="w-full border rounded px-3 py-1.5" @click="loginAsFirst">Сменить пользователя</button>
          <button class="w-full border rounded px-3 py-1.5" @click="logout">Выйти</button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <main class="p-4">
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

// Никаких async/await в <script setup>, чтобы не превращать компонент в async-setup
// ACL-стор опционален: если он есть на window.__authStore, используем, иначе — допускаем всё
const win = window as any
const auth = win.__authStore || null

function can(page: string, action: 'read'|'write'){
  return auth?.can?.(page, action) ?? true
}
const userEmail = computed(()=> auth?.current?.email ?? 'admin@example.com')

function loginAsFirst(){ try { auth?.loginAs?.(auth.users?.[0]?.id) } catch {} }
function logout(){ try { auth?.logout?.() } catch {} }

const route = useRoute()
function isActive(name: string){ return route.name === name ? 'bg-black text-white' : '' }
</script>

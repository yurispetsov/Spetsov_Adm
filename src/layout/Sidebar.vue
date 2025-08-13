<template>
  <aside class="p-4 border-r border-gray-200 bg-white min-h-screen">
    <h2 class="text-lg font-semibold mb-4">Shop Admin</h2>
    <nav class="space-y-2">
      <RouterLink class="block px-3 py-2 rounded hover:bg-gray-100" to="/dashboard">Дашборд</RouterLink>
      <RouterLink class="block px-3 py-2 rounded hover:bg-gray-100" to="/catalog/products">Товары</RouterLink>
      <RouterLink class="block px-3 py-2 rounded hover:bg-gray-100" to="/catalog/categories">Категории</RouterLink>
      <RouterLink class="block px-3 py-2 rounded hover:bg-gray-100" to="/customers">Клиенты</RouterLink>
      <RouterLink class="block px-3 py-2 rounded hover:bg-gray-100" to="/orders">Заказы</RouterLink>
      <RouterLink class="block px-3 py-2 rounded hover:bg-gray-100" to="/discounts">Скидки/Купоны</RouterLink>
      <RouterLink class="block px-3 py-2 rounded hover:bg-gray-100" to="/reports">Отчёты</RouterLink>
      <RouterLink class="block px-3 py-2 rounded hover:bg-gray-100" to="/users">Пользователи/Роли</RouterLink>
      <RouterLink class="block px-3 py-2 rounded hover:bg-gray-100" to="/settings">Настройки</RouterLink>
    </nav>
  </aside>
</template>

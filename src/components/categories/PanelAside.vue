<script setup lang="ts">
import type { CatalogCategory } from '@/shared/types/catalog'
defineProps<{ category: CatalogCategory | null }>()
</script>

<template>
  <div>
    <div class="text-sm text-gray-500 mb-2">Панель</div>
    <div v-if="category">
      <div class="text-gray-700"><b>ID:</b> {{ category.id }}</div>
      <div class="text-gray-700"><b>Родитель:</b> {{ category.parentId ?? '—' }}</div>
      <div class="text-gray-700"><b>Видимость:</b> {{ category.visible!==false ? 'Показывать' : 'Скрывать' }}</div>
    </div>
    <div v-else class="text-gray-500 text-sm">Нет выбранной категории.</div>
  </div>
</template>
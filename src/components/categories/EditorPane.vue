<template>
  <form class="space-y-4 max-w-3xl" @submit.prevent="onSave">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-xs text-gray-500 mb-1">Название</label>
        <input v-model="form.name" class="w-full px-3 py-2 rounded border"/>
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">Slug</label>
        <input v-model="form.slug" class="w-full px-3 py-2 rounded border"/>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <input id="vis" type="checkbox" v-model="form.isVisible" />
      <label for="vis" class="text-sm">Показывать на сайте</label>
    </div>

    <div>
      <label class="block text-xs text-gray-500 mb-1">Meta title</label>
      <input v-model="form.metaTitle" class="w-full px-3 py-2 rounded border"/>
    </div>
    <div>
      <label class="block text-xs text-gray-500 mb-1">H1</label>
      <input v-model="form.h1" class="w-full px-3 py-2 rounded border"/>
    </div>
    <div>
      <label class="block text-xs text-gray-500 mb-1">Meta description</label>
      <textarea v-model="form.metaDescription" rows="4" class="w-full px-3 py-2 rounded border"></textarea>
    </div>

    <div class="flex gap-2">
      <button class="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Сохранить</button>
      <button class="px-4 py-2 bg-slate-100 rounded" type="button" @click="reset">Сброс</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { CategoryNode } from '@/shared/types/catalog';

const props = defineProps<{ model: CategoryNode }>();
const emit = defineEmits<{ (e:'update', patch:any): void }>();

const form = reactive({
  name: '',
  slug: '',
  isVisible: true,
  metaTitle: '',
  h1: '',
  metaDescription: '',
});

watch(() => props.model, (m) => {
  if (!m) return;
  form.name = m.name;
  form.slug = m.slug;
  form.isVisible = m.isVisible;
  form.metaTitle = m.metaTitle ?? '';
  form.h1 = m.h1 ?? '';
  form.metaDescription = m.metaDescription ?? '';
}, { immediate: true });

function onSave() {
  emit('update', { ...form });
}

function reset() {
  const m = props.model;
  if (!m) return;
  form.name = m.name;
  form.slug = m.slug;
  form.isVisible = m.isVisible;
  form.metaTitle = m.metaTitle ?? '';
  form.h1 = m.h1 ?? '';
  form.metaDescription = m.metaDescription ?? '';
}
</script>

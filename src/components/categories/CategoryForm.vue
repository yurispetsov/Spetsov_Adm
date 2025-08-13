<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm mb-1">Название</label>
        <input v-model.trim="model.name" type="text" class="w-full border rounded px-3 py-2" required @input="autoSlug()" />
      </div>
      <div>
        <label class="block text-sm mb-1">Слаг (URL)</label>
        <input v-model.trim="model.slug" type="text" class="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm mb-1">Родитель</label>
        <select v-model="model.parentId" class="w-full border rounded px-3 py-2">
          <option :value="null">— Корень —</option>
          <option v-for="c in parentOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div class="flex items-center gap-2 pt-6">
        <input id="visible" type="checkbox" v-model="model.isVisible" />
        <label for="visible">Показывать на витрине</label>
      </div>
    </div>

    <div class="flex gap-2 justify-end pt-2">
      <button type="button" class="border rounded px-4 py-2" @click="$emit('cancel')">Отмена</button>
      <button type="submit" class="rounded px-4 py-2 bg-black text-white">Сохранить</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watchEffect } from 'vue'
import type { Category } from '@/types/Category'

const props = defineProps<{
  value?: Partial<Category> | null
  parentOptions: Array<{id:string, name:string}>
}>()
const emit = defineEmits<{ (e: 'submit', payload: Partial<Category>): void; (e: 'cancel'): void }>()

const model = reactive<Partial<Category>>({
  name: '', slug: '', parentId: null, isVisible: true
})

watchEffect(() => {
  Object.assign(model, { name: '', slug: '', parentId: null, isVisible: true })
  if (props.value) Object.assign(model, JSON.parse(JSON.stringify(props.value)))
})

function onSubmit() {
  emit('submit', JSON.parse(JSON.stringify(model)))
}

function autoSlug() {
  if (!model.slug) {
    model.slug = (model.name || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g,'-')
      .replace(/[^a-z0-9а-яё-]/gi,'')
      .replace(/-+/g,'-')
  }
}
</script>

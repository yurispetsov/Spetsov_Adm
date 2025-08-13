<template>
  <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded shadow-lg w-[520px] p-4">
      <h3 class="text-lg font-semibold mb-3">{{ model.id ? 'Изменить категорию' : 'Новая категория' }}</h3>
      <div class="grid grid-cols-1 gap-3">
        <label class="text-sm">Название
          <input v-model="model.name" class="border rounded px-3 py-2 w-full" />
        </label>
        <label class="text-sm">Slug
          <input v-model="model.slug" class="border rounded px-3 py-2 w-full" />
        </label>
        <label class="inline-flex items-center gap-2">
          <input type="checkbox" v-model="model.visible" />
          Показывать на сайте
        </label>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button class="px-3 py-2 border rounded" @click="close">Отмена</button>
        <button class="px-3 py-2 bg-black text-white rounded" @click="submit">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { Category } from '@/types/catalog';

const visible = ref(false);
const model = reactive<Partial<Category>>({ id: undefined, name: '', slug: '', visible: true });

function open(payload?: Partial<Category>){
  Object.assign(model, { id: undefined, name: '', slug: '', visible: true }, payload || {});
  visible.value = true;
}
function close(){ visible.value = false; }
function submit(){ emit('submit', { ...model }); close(); }

const emit = defineEmits<{ (e:'submit', model: Partial<Category>): void }>();
defineExpose({ open, close });
</script>

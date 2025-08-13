<template>
  <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
    <div class="bg-white rounded shadow-lg w-[680px] p-4">
      <h3 class="text-lg font-semibold mb-3">{{ model.id ? 'Изменить товар' : 'Новый товар' }}</h3>
      <div class="grid grid-cols-2 gap-3">
        <label class="text-sm">Название
          <input v-model="model.name" class="border rounded px-3 py-2 w-full" />
        </label>
        <label class="text-sm">Цена
          <input v-model.number="model.price" type="number" class="border rounded px-3 py-2 w-full" />
        </label>
        <label class="text-sm">Артикул
          <input v-model="model.article" class="border rounded px-3 py-2 w-full" />
        </label>
        <label class="text-sm">SKU
          <input v-model="model.sku" class="border rounded px-3 py-2 w-full" />
        </label>
        <div class="col-span-2">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" v-model="model.active" />
            Активен
          </label>
        </div>
        <div class="col-span-2">
          <label class="text-sm">Описание
            <textarea v-model="model.description" rows="5" class="border rounded px-3 py-2 w-full"></textarea>
          </label>
        </div>
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
import type { Product } from '@/types/catalog';

const visible = ref(false);
const model = reactive<Partial<Product>>({ name: '', price: 0, active: true });

function open(payload?: Partial<Product>){
  Object.assign(model, { id: undefined, name: '', price: 0, active: true, article: '', sku: '', description: '' }, payload || {});
  visible.value = true;
}
function close(){ visible.value = false; }
function submit(){ emit('submit', { ...model }); close(); }

const emit = defineEmits<{ (e:'submit', model: Partial<Product>): void }>();
defineExpose({ open, close });
</script>

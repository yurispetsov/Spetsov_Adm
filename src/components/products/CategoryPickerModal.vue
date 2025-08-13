<template>
  <div v-if="visible" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[70]">
    <div class="bg-white rounded shadow-lg w-[520px] p-4">
      <h3 class="text-lg font-semibold mb-3">Переместить в категорию</h3>
      <div class="max-h-[50vh] overflow-auto">
        <ul>
          <li v-for="c in flat" :key="c.id">
            <button class="w-full text-left px-2 py-1 hover:bg-gray-100 rounded" @click="pick(c.id)">
              {{ c.name }}
            </button>
          </li>
        </ul>
      </div>
      <div class="mt-3 text-right">
        <button class="px-3 py-2 border rounded" @click="close">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCategoriesStore } from '@/stores/categories';

const visible = ref(false);
const store = useCategoriesStore();
const flat = store.items;

function open(){ visible.value = true; if(!store.items.length) store.fetch(); }
function close(){ visible.value = false; }
function pick(id: string){ emit('pick', id); close(); }

const emit = defineEmits<{ (e:'pick', categoryId: string): void }>();
defineExpose({ open, close });
</script>

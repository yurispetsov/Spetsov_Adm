
<template>
  <div class="p-4">
    <div class="font-medium mb-2">Товары в категории</div>
    <div v-if="!categoryId" class="text-gray-500 text-sm">Категория не выбрана</div>
    <div v-else>
      <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>
      <table v-else class="w-full text-sm border">
        <thead class="bg-gray-50">
          <tr><th class="p-2 text-left">Название</th><th class="p-2 w-32 text-right">Цена</th></tr>
        </thead>
        <tbody>
          <tr v-for="p in items" :key="p.id" class="border-t">
            <td class="p-2">{{p.name}}</td>
            <td class="p-2 text-right">{{p.price ?? '—'}}</td>
          </tr>
          <tr v-if="items.length===0"><td class="p-2 text-gray-500" colspan="2">Нет товаров</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { fetchProductsByCategory } from "@/shared/api/products";

const props = defineProps<{ categoryId: number | null }>();
const items = ref<any[]>([]);
const loading = ref(false);

watch(()=>props.categoryId, async (id)=>{
  if(!id){ items.value=[]; return; }
  loading.value = true;
  try{
    const { data } = await fetchProductsByCategory(id, 1, 10);
    items.value = data;
  }catch(e){
    items.value = [];
  }finally{
    loading.value = false;
  }
},{ immediate: true });
</script>

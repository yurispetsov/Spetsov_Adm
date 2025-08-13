<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { CatalogCategory } from '@/shared/types/catalog'

const props = defineProps<{ category: CatalogCategory }>()
const emit = defineEmits(['save'])

const model = reactive({
  metaTitle: '',
  h1: '',
  metaDescription: ''
})

watch(()=>props.category, (c)=>{
  model.metaTitle = c.metaTitle || ''
  model.h1 = c.h1 || ''
  model.metaDescription = c.metaDescription || ''
}, {immediate:true})

function save(){
  emit('save',{ metaTitle: model.metaTitle, h1: model.h1, metaDescription: model.metaDescription })
}
</script>

<template>
  <div class="space-y-3">
    <label class="block">
      <div class="text-xs text-gray-500 mb-1">Meta title</div>
      <input class="input w-full" v-model="model.metaTitle" />
    </label>
    <label class="block">
      <div class="text-xs text-gray-500 mb-1">H1</div>
      <input class="input w-full" v-model="model.h1" />
    </label>
    <label class="block">
      <div class="text-xs text-gray-500 mb-1">Meta description</div>
      <textarea class="input w-full" rows="4" v-model="model.metaDescription"></textarea>
    </label>
    <button class="btn" @click="save">Сохранить</button>
  </div>
</template>

<style scoped>
.input{ @apply border rounded px-3 py-1.5; }
.btn{ @apply px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700; }
</style>
<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { CatalogCategory } from '@/shared/types/catalog'

const props = defineProps<{ category: CatalogCategory }>()
const emit = defineEmits(['save'])

const model = reactive({
  slug: '',
  visible: true as boolean,
})
watch(()=>props.category, (c)=>{
  model.slug = c.slug || ''
  model.visible = c.visible !== false
}, {immediate:true})

function save(){
  emit('save', { slug: model.slug, visible: model.visible })
}
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-3 gap-3">
      <label class="col-span-2">
        <div class="text-xs text-gray-500 mb-1">Slug</div>
        <input class="input w-full" v-model="model.slug" placeholder="slug" />
      </label>
      <label>
        <div class="text-xs text-gray-500 mb-1">Видимость</div>
        <select class="input w-full" v-model="model.visible">
          <option :value="true">Показывать</option>
          <option :value="false">Скрывать</option>
        </select>
      </label>
    </div>
    <button class="btn" @click="save">Сохранить</button>
  </div>
</template>

<style scoped>
.input{ @apply border rounded px-3 py-1.5; }
.btn{ @apply px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700; }
</style>
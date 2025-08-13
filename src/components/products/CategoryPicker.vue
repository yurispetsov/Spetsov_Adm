<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/shared/api/client'
const props = defineProps<{ modelValue?: string[] }>()
const emit = defineEmits<{ (e:'update:modelValue', v:string[]):void }>()
const items = ref<{ id:string; name:string; parentId?:string }[]>([])
const value = ref<string[]>(props.modelValue || [])
onMounted(async ()=>{
  try{
    const { data } = await api.get('/categories')
    items.value = data?.items || data || []
  } catch { items.value = [] }
})
function toggle(id:string){
  const s = new Set(value.value)
  s.has(id) ? s.delete(id) : s.add(id)
  value.value = Array.from(s)
  emit('update:modelValue', value.value)
}
</script>

<template>
  <div>
    <div v-if="!items.length" class="text-sm text-gray-500">Категории не найдены</div>
    <div v-else class="space-y-1">
      <label v-for="c in items" :key="c.id" class="flex items-center gap-2">
        <input type="checkbox" :checked="(value||[]).includes(c.id)" @change="toggle(c.id)" />
        <span class="text-sm">{{ c.name }}</span>
      </label>
    </div>
  </div>
</template>

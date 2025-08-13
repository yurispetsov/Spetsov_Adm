<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CatalogCategory } from '@/shared/types/catalog'
import InspectorInfo from './InspectorInfo.vue'
import InspectorSEO from './InspectorSEO.vue'
import InspectorProducts from './InspectorProducts.vue'

const props = defineProps<{ category: CatalogCategory }>()
const emit = defineEmits(['save'])
const tab = ref<'info'|'seo'|'products'>('info')

watch(() => props.category.id, () => tab.value='info')
</script>

<template>
  <div>
    <div class="flex gap-2 border-b mb-3">
      <button :class="['tab', {active:tab==='info'}]" @click="tab='info'">Инфо</button>
      <button :class="['tab', {active:tab==='seo'}]" @click="tab='seo'">SEO</button>
      <button :class="['tab', {active:tab==='products'}]" @click="tab='products'">Товары</button>
    </div>
    <InspectorInfo v-if="tab==='info'" :category="props.category" @save="emit('save',$event)" />
    <InspectorSEO v-else-if="tab==='seo'" :category="props.category" @save="emit('save',$event)" />
    <InspectorProducts v-else :category-id="props.category.id" />
  </div>
</template>

<style scoped>
.tab{ @apply px-3 py-2 -mb-px rounded-t border border-b-0 bg-gray-50 hover:bg-white; }
.tab.active{ @apply bg-white border-gray-300; }
</style>
<template>
  <dialog ref="dlg" class="rounded-xl p-0 w-[720px] max-w-[95vw] max-h-[90vh]">
    <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
      <div class="font-medium">{{ title }}</div>
      <button class="text-sm opacity-70" @click="close()">✕</button>
    </div>
    <div class="p-4 overflow-auto" style="max-height: calc(90vh - 56px)">
      <CategoryForm :value="value" :parentOptions="parentOptions" @submit="onSubmit" @cancel="close" />
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CategoryForm from './CategoryForm.vue'
import type { Category } from '@/types/Category'

const props = defineProps<{
  value: Partial<Category> | null
  parentOptions: Array<{id:string,name:string}>
  title?: string
}>()
const emit = defineEmits(['submit'])

const dlg = ref<HTMLDialogElement | null>(null)

function open() { dlg.value?.showModal() }
function close() { dlg.value?.close() }
function onSubmit(payload: any) {
  emit('submit', payload)
  close()
}

defineExpose({ open, close })
</script>

<style>
dialog::backdrop { background: rgba(0,0,0,.2); }
dialog { border: 1px solid #eee; }
</style>

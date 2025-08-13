<script setup lang="ts">
const emit = defineEmits<{ (e:'files', files: File[]):void }>()
function onChange(e: Event){
  const files = Array.from((e.target as HTMLInputElement).files || [])
  emit('files', files)
  ;(e.target as HTMLInputElement).value=''
}
function onDrop(e: DragEvent){
  const files = Array.from(e.dataTransfer?.files || [])
  emit('files', files)
}
</script>

<template>
  <div class="border-2 border-dashed rounded-xl bg-white p-6 text-center"
       @drop.prevent="onDrop" @dragover.prevent>
    <div class="text-indigo-600 font-medium">Добавить файлы</div>
    <div class="text-xs text-gray-500 mt-1">Поддерживаются .jpg, .png, .gif</div>
    <div class="mt-3">
      <label class="btn">
        Выбрать файлы
        <input class="hidden" type="file" multiple accept="image/*" @change="onChange" />
      </label>
    </div>
  </div>
</template>

<style scoped>
.btn{ @apply inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50; }
</style>

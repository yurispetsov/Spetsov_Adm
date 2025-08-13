<template>
  <div>
    <div class="flex flex-wrap items-center gap-1 mb-2">
      <button class="btn" type="button" @click="cmd('bold')"><b>B</b></button>
      <button class="btn" type="button" @click="cmd('italic')"><i>I</i></button>
      <button class="btn" type="button" @click="cmd('underline')"><u>U</u></button>
      <button class="btn" type="button" @click="cmd('insertUnorderedList')">• Список</button>
      <button class="btn" type="button" @click="cmd('insertOrderedList')">1. Список</button>
      <button class="btn" type="button" @click="insertLink">Ссылка</button>
      <button class="btn" type="button" @click="cmd('undo')">↶</button>
      <button class="btn" type="button" @click="cmd('redo')">↷</button>
    </div>
    <div
      ref="box"
      class="min-h-[140px] rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      contenteditable
      :placeholder="placeholder"
      @input="onInput"
      @blur="onInput"
    ></div>
    <p class="mt-1 text-xs text-gray-500">{{ helper }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
const props = withDefaults(defineProps<{ modelValue: string; placeholder?: string; helper?: string }>(), { modelValue:'', placeholder:'', helper:'' })
const emit = defineEmits<{ (e:'update:modelValue', v:string): void }>()

const box = ref<HTMLDivElement|null>(null)
onMounted(()=>{
  if (box.value) box.value.innerHTML = props.modelValue || ''
})
watch(()=>props.modelValue, (v)=>{
  if (box.value && box.value.innerHTML !== (v || '')) box.value.innerHTML = v || ''
})

function onInput(){
  emit('update:modelValue', box.value?.innerHTML || '')
}
function cmd(name:string){ document.execCommand(name, false); onInput() }
function insertLink(){
  const url = prompt('URL')
  if (url) document.execCommand('createLink', false, url)
  onInput()
}
</script>

<style scoped>
.btn{ @apply inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium border border-gray-300 hover:bg-gray-50; }
</style>

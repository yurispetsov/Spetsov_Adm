<template>
  <dialog ref="dlg" class="rounded-xl p-0 w-[720px] max-w-[96vw]">
    <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
      <div class="font-medium">{{ title }}</div>
      <button class="opacity-70" @click="close">✕</button>
    </div>
    <div class="p-4 grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm mb-1">Ключ</label>
        <input v-model="model.key" class="border rounded px-3 py-2 w-full" placeholder="retail, wholesale1, wholesale2..." />
      </div>
      <div>
        <label class="block text-sm mb-1">Название</label>
        <input v-model="model.name" class="border rounded px-3 py-2 w-full" placeholder="Розничная" />
      </div>
      <div>
        <label class="block text-sm mb-1">Наценка, %</label>
        <input v-model.number="model.markupPercent" type="number" class="border rounded px-3 py-2 w-full" />
      </div>
      <div>
        <label class="block text-sm mb-1">Скидка, %</label>
        <input v-model.number="model.discountPercent" type="number" class="border rounded px-3 py-2 w-full" />
      </div>
      <div class="flex items-center">
        <label class="inline-flex items-center"><input type="checkbox" v-model="model.active" class="mr-2" /> Активен</label>
      </div>
    </div>
    <div class="p-3 border-t flex justify-end gap-2">
      <button class="border rounded px-3 py-2" @click="close">Отмена</button>
      <button class="rounded px-3 py-2 bg-black text-white" @click="submit">Сохранить</button>
    </div>
  </dialog>
</template>
<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { PriceType } from '@/api/discounts'

const props = defineProps<{ value: PriceType | null, title: string }>()
const emit = defineEmits(['submit','close'])

const dlg = ref<HTMLDialogElement|null>(null)
const model = ref<any>({})

async function open(){
  await nextTick()
  model.value = JSON.parse(JSON.stringify(props.value || { key:'', name:'', active:true }))
  dlg.value?.showModal()
}
function close(){ dlg.value?.close(); emit('close') }
function submit(){ emit('submit', model.value) }

defineExpose({ open, close })
</script>
<style>
dialog::backdrop { background: rgba(0,0,0,.2) }
dialog { border: 1px solid #eee }
</style>

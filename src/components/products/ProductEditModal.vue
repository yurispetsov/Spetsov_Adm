<template>
  <dialog ref="dlg" class="rounded-xl p-0 w-[1100px] max-w-[96vw]">
    <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
      <div class="font-medium">Товар</div>
      <button class="opacity-70" @click="close">✕</button>
    </div>

    <div class="p-4">
      <div class="mb-3 flex gap-2">
        <button :class="tabBtn('info')" @click="tab='info'">Описание</button>
        <button :class="tabBtn('attrs')" @click="tab='attrs'">Характеристики</button>
        <button :class="tabBtn('metrics')" @click="tab='metrics'">Числовые поля и единицы</button>
        <button :class="tabBtn('docs')" @click="tab='docs'">Документы</button>
      </div>

      <div v-if="tab==='info'" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Название</label>
          <input v-model="model.name" class="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-sm mb-1">SKU</label>
          <input v-model="model.sku" class="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-sm mb-1">Артикул</label>
          <input v-model="model.article" class="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-sm mb-1">Цена</label>
          <input v-model.number="model.price" type="number" class="border rounded px-3 py-2 w-full" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm mb-1">Описание</label>
          <textarea v-model="model.description" rows="8" class="border rounded px-3 py-2 w-full" placeholder="Текст, ссылки, форматирование Markdown поддержим позже"></textarea>
        </div>
      </div>

      <div v-else-if="tab==='attrs'" class="space-y-2">
        <div class="text-sm text-gray-600">Ключ-значение</div>
        <div v-for="(a,i) in model.attributes" :key="i" class="grid grid-cols-2 gap-2">
          <input v-model="a.name" placeholder="Наименование" class="border rounded px-2 py-1" />
          <input v-model="a.value" placeholder="Значение" class="border rounded px-2 py-1" />
        </div>
        <button class="border rounded px-2 py-1 mt-2" @click="model.attributes.push({name:'',value:''})">+ добавить</button>
      </div>

      <div v-else-if="tab==='metrics'" class="space-y-2">
        <div class="text-sm text-gray-600">Название — число — единица</div>
        <div v-for="(m,i) in model.metrics" :key="i" class="grid grid-cols-3 gap-2">
          <input v-model="m.name" placeholder="Параметр" class="border rounded px-2 py-1" />
          <input v-model.number="m.value" type="number" placeholder="Число" class="border rounded px-2 py-1" />
          <input v-model="m.unit" placeholder="Ед." class="border rounded px-2 py-1" />
        </div>
        <button class="border rounded px-2 py-1 mt-2" @click="model.metrics.push({name:'', value:0, unit:''})">+ добавить</button>
      </div>

      <div v-else class="space-y-2">
        <div v-for="(d,i) in model.documents" :key="i" class="grid grid-cols-3 gap-2 items-center">
          <input v-model="d.name" placeholder="Название" class="border rounded px-2 py-1" />
          <input v-model="d.url" placeholder="URL или путь" class="border rounded px-2 py-1 col-span-2" />
        </div>
        <button class="border rounded px-2 py-1 mt-2" @click="model.documents.push({name:'', url:''})">+ документ</button>
        <p class="text-xs text-gray-500">Загрузку файлов подключим к API позже; пока ссылки/пути.</p>
      </div>
    </div>

    <div class="p-3 border-t flex justify-between items-center">
      <label class="inline-flex items-center text-sm"><input type="checkbox" v-model="model.active" class="mr-2" /> Активен</label>
      <div class="flex gap-2">
        <button class="border rounded px-3 py-2" @click="close">Отмена</button>
        <button class="rounded px-3 py-2 bg-black text-white" @click="submit">Сохранить</button>
      </div>
    </div>
  </dialog>
</template>
<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Product } from '@/api/products'

const props = defineProps<{ value: Product | null }>()
const emit = defineEmits(['submit','close'])

const dlg = ref<HTMLDialogElement|null>(null)
const model = ref<any>({})
const tab = ref<'info'|'attrs'|'metrics'|'docs'>('info')

function tabBtn(t:string){ return tab.value===t ? 'px-3 py-2 rounded bg-black text-white' : 'px-3 py-2 rounded border' }

async function open(){
  await nextTick()
  model.value = JSON.parse(JSON.stringify(props.value || { name:'', sku:'', article:'', price:0, active:true, attributes:[], metrics:[], documents:[] }))
  dlg.value?.showModal()
}
function close(){ dlg.value?.close(); emit('close') }
function submit(){ emit('submit', model.value) }

defineExpose({ open, close })
</script>
<style>
dialog::backdrop { background: rgba(0,0,0,.25) }
dialog { border: 1px solid #eee }
</style>

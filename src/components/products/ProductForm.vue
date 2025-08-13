<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm mb-1">Название</label>
        <input v-model="model.name" type="text" class="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label class="block text-sm mb-1">SKU</label>
        <input v-model="model.sku" type="text" class="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label class="block text-sm mb-1">Артикул</label>
        <input v-model="model.article" type="text" class="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label class="block text-sm mb-1">Категория</label>
        <select v-model="model.categoryId" class="w-full border rounded px-3 py-2">
          <option :value="null">—</option>
          <option value="c1">Запчасти</option>
          <option value="c2">Масла и жидкости</option>
          <option value="c3">Инструменты</option>
        </select>
      </div>
      <div>
        <label class="block text-sm mb-1">Цена</label>
        <input v-model.number="model.price" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label class="block text-sm mb-1">Остаток, шт</label>
        <input v-model.number="model.stock" type="number" min="0" step="1" class="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label class="block text-sm mb-1">Статус</label>
        <select v-model="model.status" class="w-full border rounded px-3 py-2">
          <option value="draft">Черновик</option>
          <option value="active">Активен</option>
          <option value="archived">Архив</option>
        </select>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border rounded">
      <div class="flex gap-1 border-b p-2 overflow-x-auto">
        <button type="button" class="px-3 py-2 rounded"
                :class="tab==='desc' ? 'bg-gray-100 font-medium' : ''"
                @click="tab='desc'">Описание</button>
        <button type="button" class="px-3 py-2 rounded"
                :class="tab==='specs' ? 'bg-gray-100 font-medium' : ''"
                @click="tab='specs'">Характеристики</button>
        <button type="button" class="px-3 py-2 rounded"
                :class="tab==='docs' ? 'bg-gray-100 font-medium' : ''"
                @click="tab='docs'">Документы</button>
      </div>

      <!-- Description -->
      <div v-if="tab==='desc'" class="p-4 space-y-2">
        <div class="flex flex-wrap gap-2">
          <button type="button" class="border rounded px-2 py-1" @click="cmd('bold')"><b>B</b></button>
          <button type="button" class="border rounded px-2 py-1" @click="cmd('italic')"><i>I</i></button>
          <button type="button" class="border rounded px-2 py-1" @click="cmd('underline')"><u>U</u></button>
          <button type="button" class="border rounded px-2 py-1" @click="cmd('insertUnorderedList')">• Список</button>
          <button type="button" class="border rounded px-2 py-1" @click="cmd('insertOrderedList')">1. Список</button>
          <button type="button" class="border rounded px-2 py-1" @click="insertLink()">Ссылка</button>
          <button type="button" class="border rounded px-2 py-1" @click="clearFormatting()">Очистить формат</button>
        </div>
        <div ref="editorRef"
             class="min-h-[180px] border rounded p-3"
             contenteditable
             @input="onEditorInput"
             @blur="onEditorInput"></div>
      </div>

      <!-- Specs (numeric + unit in one grid) -->
      <div v-else-if="tab==='specs'" class="p-4 space-y-2">
        <div class="flex justify-between items-center">
          <div class="font-medium">Характеристики (число + единицы)</div>
          <div class="flex gap-2">
            <button type="button" class="border rounded px-3 py-1" @click="addMetric">+ Добавить строку</button>
            <button type="button" class="border rounded px-3 py-1" @click="importCommon">Заполнить типовыми</button>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-2 font-medium text-sm opacity-80">
          <div class="col-span-6">Наименование</div>
          <div class="col-span-3">Число</div>
          <div class="col-span-3">Единицы</div>
        </div>
        <div class="space-y-2">
          <div v-for="(m, i) in model.metrics" :key="i" class="grid grid-cols-12 gap-2">
            <input v-model="m.name" class="col-span-6 border rounded px-2 py-1" placeholder="Например: Вес" />
            <input v-model.number="m.value" type="number" step="0.0001" class="col-span-3 border rounded px-2 py-1" placeholder="0" />
            <input v-model="m.unit" class="col-span-2 border rounded px-2 py-1" placeholder="кг" list="unitOptions" />
            <button type="button" class="col-span-1 border rounded px-2 py-1" @click="removeMetric(i)">×</button>
          </div>
          <div v-if="!model.metrics.length" class="text-sm opacity-60">Пока нет характеристик</div>
        </div>
        <datalist id="unitOptions">
          <option value="шт" />
          <option value="кг" />
          <option value="г" />
          <option value="мм" />
          <option value="см" />
          <option value="м" />
          <option value="мл" />
          <option value="л" />
          <option value="Вт" />
          <option value="В" />
          <option value="А" />
          <option value="Ч" />
          <option value="%" />
        </datalist>
      </div>

      <!-- Documents -->
      <div v-else class="p-4 space-y-3">
        <div class="flex items-center gap-2">
          <input type="file" multiple @change="onDocsChange" />
        </div>
        <div class="space-y-2">
          <div v-for="doc in model.documents" :key="doc.id" class="flex items-center gap-3 border rounded p-2">
            <input v-model="doc.title" class="border rounded px-2 py-1 flex-1" placeholder="Название документа" />
            <span class="text-sm opacity-70">{{ doc.fileName }}</span>
            <button type="button" class="border rounded px-2 py-1" @click="removeDoc(doc.id)">Удалить</button>
          </div>
          <div v-if="!model.documents.length" class="text-sm opacity-60">Документы не прикреплены</div>
        </div>
        <p class="text-xs opacity-60">
          Документы сохраняются как метаданные в демо-режиме (без загрузки содержимого). В реальной интеграции нужен эндпойнт загрузки.
        </p>
      </div>
    </div>

    <div class="flex gap-2 justify-end pt-2">
      <button type="button" class="border rounded px-4 py-2" @click="$emit('cancel')">Отмена</button>
      <button type="submit" class="rounded px-4 py-2 bg-black text-white">Сохранить</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watchEffect } from 'vue'
import type { Product, ProductDocument, ProductMetric } from '@/types/Product'

const props = defineProps<{
  value?: Partial<Product> | null
}>()
const emit = defineEmits<{ (e: 'submit', payload: Partial<Product>): void; (e: 'cancel'): void }>()

const tab = ref<'desc'|'specs'|'docs'>('desc')
const editorRef = ref<HTMLDivElement | null>(null)

const model = reactive<Partial<Product>>({
  name: '', sku: '', article: '', categoryId: null, price: 0, stock: 0, status: 'active',
  descriptionHtml: '',
  specs: [],
  metrics: [],
  documents: [],
})

watchEffect(() => {
  Object.assign(model, {
    name: '', sku: '', article: '', categoryId: null, price: 0, stock: 0, status: 'active',
    descriptionHtml: '',
    specs: [],
    metrics: [],
    documents: [],
  })
  if (props.value) Object.assign(model, JSON.parse(JSON.stringify(props.value)))
  if (!model.metrics) model.metrics = []
  if (editorRef.value) editorRef.value.innerHTML = model.descriptionHtml || ''
})

function onEditorInput() {
  if (editorRef.value) {
    model.descriptionHtml = editorRef.value.innerHTML
  }
}

function cmd(name: string) {
  document.execCommand(name, false)
  onEditorInput()
}
function insertLink() {
  const url = prompt('Ссылка (URL):')
  if (url) document.execCommand('createLink', false, url)
}
function clearFormatting() {
  document.execCommand('removeFormat', false)
}

// metrics helpers
function addMetric() {
  model.metrics!.push({ name: '', value: null, unit: '' })
}
function removeMetric(i: number) { model.metrics!.splice(i,1) }
function importCommon() {
  const exists = new Set(model.metrics!.map(m => m.name.trim().toLowerCase()))
  const common: ProductMetric[] = [
    { name: 'Вес', value: null, unit: 'кг' },
    { name: 'Длина', value: null, unit: 'см' },
    { name: 'Ширина', value: null, unit: 'см' },
    { name: 'Высота', value: null, unit: 'см' },
  ]
  for (const m of common) {
    if (!exists.has(m.name.toLowerCase())) model.metrics!.push({ ...m })
  }
}

// documents
function onDocsChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  for (const f of Array.from(input.files)) {
    const id = 'd' + Math.random().toString(36).slice(2,8)
    const doc: ProductDocument = { id, title: f.name.replace(/\.[^.]+$/, ''), fileName: f.name, mime: f.type }
    model.documents!.push(doc)
  }
  input.value = ''
}
function removeDoc(id: string) {
  const i = model.documents!.findIndex(d => d.id === id)
  if (i >= 0) model.documents!.splice(i,1)
}

function onSubmit() {
  onEditorInput()
  model.metrics = (model.metrics || []).filter(m => m.name || m.value != null || m.unit)
  emit('submit', JSON.parse(JSON.stringify(model)))
}

onMounted(() => {
  if (editorRef.value) editorRef.value.innerHTML = model.descriptionHtml || ''
})
</script>

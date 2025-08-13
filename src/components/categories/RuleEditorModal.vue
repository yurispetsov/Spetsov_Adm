<template>
  <dialog ref="dlg" class="rounded-xl p-0 w-[860px] max-w-[96vw] max-h-[90vh]">
    <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
      <div class="font-medium">Правила автокатегоризации — {{ categoryName }}</div>
      <button class="text-sm opacity-70" @click="close()">✕</button>
    </div>

    <div class="grid grid-cols-12 gap-4 p-4">
      <div class="col-span-7">
        <div class="text-sm opacity-70 mb-2">Запрос (пример: <code>brand:Bosch -status:archived "масло" price>=500</code>)</div>
        <div class="flex gap-2">
          <input v-model="query" @input="onPreview" placeholder='Напишите правило…'
                 class="border rounded px-3 py-2 flex-1" />
          <button class="border rounded px-3" @click="addRule">Добавить</button>
        </div>

        <ul class="mt-4 border rounded divide-y max-h-[32vh] overflow-auto">
          <li v-for="r in rules.items" :key="r.id" class="p-2 flex items-center gap-2">
            <input type="checkbox" :checked="r.enabled" @change="rules.patch(r.id, { enabled: ($event.target as HTMLInputElement).checked }, categoryId)" />
            <input class="w-14 border rounded px-2 py-1" type="number" :value="r.priority"
                   @change="rules.patch(r.id, { priority: +($event.target as HTMLInputElement).value }, categoryId)" />
            <div class="flex-1 truncate">{{ r.query }}</div>
            <button class="text-xs underline" @click="previewExisting(r.query)">Preview</button>
            <button class="text-xs underline text-green-700" @click="apply(r.id)">Применить</button>
            <button class="text-xs underline text-red-600" @click="rules.remove(r.id, categoryId)">Удалить</button>
          </li>
          <li v-if="!rules.items.length" class="p-2 text-sm opacity-60">Пока нет правил</li>
        </ul>
      </div>

      <div class="col-span-5">
        <div class="text-sm opacity-70 mb-2">Предпросмотр совпадений (первые 100)</div>
        <div class="border rounded p-2 max-h-[48vh] overflow-auto text-sm">
          <div class="mb-2 opacity-70">Совпадений: {{ rules.preview.total }}</div>
          <ul class="space-y-1">
            <li v-for="id in rules.preview.ids" :key="id">
              <code>{{ id }}</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useCategoryRulesStore } from '@/stores/categoryRules'

const props = defineProps<{ categoryId: string; categoryName: string }>()
const rules = useCategoryRulesStore()
const dlg = ref<HTMLDialogElement|null>(null)
const query = ref('')

async function open() {
  await rules.fetch(props.categoryId)
  query.value = ''
  dlg.value?.showModal()
  nextTick(onPreview)
}
function close(){ dlg.value?.close() }
async function onPreview(){ await rules.doPreview(query.value) }
async function addRule(){
  if (!query.value.trim()) return
  await rules.add(props.categoryId, query.value.trim())
  query.value = ''
  await rules.fetch(props.categoryId)
}
async function previewExisting(q: string){ await rules.doPreview(q) }
async function apply(id: string){ await rules.doApply(id) }

defineExpose({ open, close })
</script>

<style>
dialog::backdrop { background: rgba(0,0,0,.2) }
dialog { border: 1px solid #eee }
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/shared/api/client'
import RootRail from '@/components/categories/RootRail.vue'
import Subgrid from '@/components/categories/Subgrid.vue'
import RootEditModal from '@/components/categories/RootEditModal.vue'

type Cat = { id:string; name:string; parentIds?: string[]; icon?: string; count?: number }

const items = ref<Cat[]>([])
const selectedRootId = ref<string|null>(null)
const selectedChildId = ref<string|null>(null)

const roots = computed(()=> items.value.filter(x => !x.parentIds || x.parentIds.length===0))
const children = computed(()=> items.value.filter(x => (x.parentIds||[])[0] === selectedRootId.value))

const editorOpen = ref(false)
const editorTarget = ref<Cat|null>(null)

async function load(){
  const { data } = await api.get('/categories')
  items.value = data || []
  if (!selectedRootId.value && roots.value.length) selectedRootId.value = roots.value[0].id
}

async function addRoot(){
  const name = prompt('Название нового раздела')
  if (!name) return
  const body: Cat = { id: crypto.randomUUID(), name, parentIds: [], icon: '📁' }
  await api.post('/categories', body)
  await load()
  selectedRootId.value = body.id
}

async function addChild(){
  if (!selectedRootId.value) return
  const name = prompt('Название подкатегории')
  if (!name) return
  const body: Cat = { id: crypto.randomUUID(), name, parentIds: [selectedRootId.value] }
  await api.post('/categories', body)
  await load()
}

async function rename(){
  const target = items.value.find(x => x.id === (selectedChildId.value || selectedRootId.value))
  if (!target) return
  const name = prompt('Новое имя', target.name)
  if (!name) return
  await api.patch('/categories/' + target.id, { name })
  await load()
}

async function removeItem(){
  const target = items.value.find(x => x.id === (selectedChildId.value || selectedRootId.value))
  if (!target) return
  if (!confirm('Удалить "' + target.name + '" и связи?')) return
  await api.delete('/categories/' + target.id)
  // снять родителя у детей
  const childs = items.value.filter(x => (x.parentIds||[])[0] === target.id)
  for (const c of childs) await api.patch('/categories/' + c.id, { parentIds: [] })
  await load()
  selectedChildId.value = null
  if (target.parentIds?.length===0) selectedRootId.value = roots.value[0]?.id || null
}

async function move(payload:{ id:string; to:string }){
  await api.patch('/categories/' + payload.id, { parentIds: [payload.to] })
  await load()
}

function openDeeper(id:string){
  selectedRootId.value = id
  selectedChildId.value = null
}

function openRootEditor(id:string){
  const r = roots.value.find(x => x.id===id) || null
  if (!r) return
  editorTarget.value = r
  editorOpen.value = True
}

async function submitRootEditor(payload:{ name:string; icon?:string|null }){
  if (!editorTarget.value) return
  await api.patch('/categories/' + editorTarget.value.id, { name: payload.name, icon: payload.icon || '' })
  editorOpen.value = false
  await load()
}

onMounted(load)
</script>

<template>
  <div class="flex">
    <RootRail
      :items="roots"
      v-model="selectedRootId"
      @add-root="addRoot"
      @rename-root="(id)=>{ selectedRootId=id; rename() }"
      @edit-root="openRootEditor"
      @delete-root="(id)=>{ selectedRootId=id; removeItem() }"
    />

    <main class="flex-1">
      <Subgrid
        :items="children"
        :title="roots.find(r => r.id===selectedRootId)?.name || 'Раздел'"
        hint="Подкатегории текущего раздела. Клик — выбрать, 'Открыть' — перейти на уровень ниже."
        :selected-id="selectedChildId"
        @select="selectedChildId=$event"
        @edit="openDeeper"
        @add-child="addChild"
        @rename="rename"
        @delete="removeItem"
        @move="move"
      />
    </main>

    <RootEditModal :open="editorOpen" :model="editorTarget" @close="editorOpen=false" @submit="submitRootEditor" />
  </div>
</template>

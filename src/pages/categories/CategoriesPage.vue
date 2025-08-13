<template>
  <section class="p-4 h-[calc(100vh-88px)] grid grid-cols-[360px,1fr] gap-4">
    <!-- left: tree & search -->
    <div class="border rounded flex flex-col">
      <div class="p-3 border-b">
        <input v-model="q" class="border rounded px-3 py-2 w-full" placeholder="Поиск..." />
      </div>
      <div class="flex-1 overflow-auto p-2">
        <TreeNode
          v-for="n in filteredTree"
          :key="n.id"
          :node="n"
          :level="0"
          :onSelect="select"
        />
        <div v-if="!filteredTree.length" class="opacity-60 p-3">Ничего не найдено</div>
      </div>
    </div>

    <!-- right: editor + inspector -->
    <div class="grid grid-rows-[auto,1fr] gap-4 h-full">
      <div class="border rounded p-4">
        <div v-if="current">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm mb-1">Название</label>
              <input v-model="form.name" class="border rounded px-3 py-2 w-full" @change="onUpdate('name', form.name)" />
            </div>
            <div>
              <label class="block text-sm mb-1">Slug</label>
              <input v-model="form.slug" class="border rounded px-3 py-2 w-full" @change="onUpdate('slug', form.slug)" />
            </div>
          </div>
          <label class="inline-flex items-center mt-3">
            <input type="checkbox" v-model="form.visible" class="mr-2" @change="onUpdate('visible', form.visible)" />
            Показывать на сайте
          </label>

          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm mb-1">Meta title</label>
              <input v-model="form.metaTitle" class="border rounded px-3 py-2 w-full" />
            </div>
            <div>
              <label class="block text-sm mb-1">H1</label>
              <input v-model="form.h1" class="border rounded px-3 py-2 w-full" />
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm mb-1">Meta description</label>
            <textarea v-model="form.metaDescription" rows="5" class="border rounded px-3 py-2 w-full"></textarea>
          </div>

          <div class="mt-4 flex gap-2">
            <button class="rounded px-4 py-2 bg-black text-white" @click="onSave">Сохранить</button>
            <button class="border rounded px-4 py-2" @click="resetForm">Сброс</button>
          </div>
        </div>
        <div v-else class="opacity-60">Выберите категорию слева</div>
      </div>

      <InspectorProducts :category-id="selectedId" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import TreeNode from '@/components/categories/TreeNode.vue'
import InspectorProducts from '@/components/categories/InspectorProducts.vue'

const store = useCategoriesStore() as any

// --------- safe loaders (алиасы) ----------
function callLoad(){
  if (typeof store.load === 'function') return store.load()
  if (typeof store.fetch === 'function') return store.fetch()
  if (typeof store.fetchAll === 'function') return store.fetchAll()
  if (typeof store.init === 'function') return store.init()
  if (typeof store.loadTree === 'function') return store.loadTree()
  if (typeof store.refresh === 'function') return store.refresh()
}
function callUpdateField(payload:any){
  if (typeof store.updateField === 'function') return store.updateField(payload)
  if (typeof store.patch === 'function') return store.patch(payload)
  if (typeof store.update === 'function') return store.update(payload)
  if (typeof store.save === 'function') return store.save(payload)
  if (typeof store.saveCategory === 'function') return store.saveCategory(payload)
}
function callSaveCategory(model:any){
  if (typeof store.saveCategory === 'function') return store.saveCategory(model)
  if (typeof store.save === 'function') return store.save(model)
  if (typeof store.update === 'function') return store.update(model)
  if (typeof store.patch === 'function') return store.patch(model)
}
// -----------------------------------------

onMounted(()=> callLoad())

const q = ref('')
const tree = computed<any[]>(() => store.tree || store.items || [])
const selectedId = ref<string|null>(null)
const current = computed(() => {
  const id = selectedId.value
  let hit:any = null
  function walk(list:any[]){
    for (const n of list) {
      if (n.id === id) { hit = n; return }
      if (n.children?.length) walk(n.children)
      if (hit) return
    }
  }
  walk(tree.value || [])
  return hit
})

const form = reactive<any>({
  id: '', name: '', slug: '', visible: true, metaTitle: '', h1: '', metaDescription: ''
})

watch(current, (n)=>{
  if (!n){ selectedId.value = null; return }
  form.id = n.id
  form.name = n.name || ''
  form.slug = n.slug || ''
  form.visible = typeof n.visible === 'boolean' ? n.visible : true
  form.metaTitle = n.metaTitle || ''
  form.h1 = n.h1 || ''
  form.metaDescription = n.metaDescription || ''
}, { immediate: true })

function select(id: string){ selectedId.value = id }
function resetForm(){ if (current.value) selectedId.value = current.value.id } // перечитает

function onUpdate(field: string, value: any){
  if (!current.value) return
  callUpdateField({ id: current.value.id, field, value })
}

function onSave(){
  callSaveCategory({ ...form })
}

const filteredTree = computed(()=>{
  const v = q.value.trim().toLowerCase()
  if (!v) return tree.value || []
  function match(n:any){ return (n.name||'').toLowerCase().includes(v) || (n.slug||'').toLowerCase().includes(v) }
  function filter(list:any[]):any[]{
    const res:any[] = []
    for (const n of list || []) {
      const kids = filter(n.children || [])
      if (match(n) || kids.length) res.push({ ...n, children: kids })
    }
    return res
  }
  return filter(tree.value || [])
})
</script>

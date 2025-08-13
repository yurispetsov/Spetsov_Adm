<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchCatalog, buildTree, createNode, type CatalogNode } from '@/shared/api/catalog'
import CatalogTree from '@/components/catalog/CatalogTree.vue'
import NodeGrid from '@/components/catalog/NodeGrid.vue'
import NodeEditorDrawer from '@/components/catalog/NodeEditorDrawer.vue'

const items = ref<CatalogNode[]>([])
const tree = ref<{roots:any[], byId:Record<string, any>}>({ roots:[], byId:{} })
const currentId = ref<string|null>(null)
const editorId = ref<string|null>(null)
const search = ref('')
const creating = ref(false)

async function load(){
  const list = await fetchCatalog()
  items.value = list
  const built = buildTree(list)
  tree.value = built
  if(currentId.value && !tree.value.byId[currentId.value]) currentId.value = null
}
onMounted(load)

const current = computed(()=> currentId.value ? tree.value.byId[currentId.value] : null)

const filteredTree = computed(()=>{
  const q = search.value.trim().toLowerCase()
  if(!q) return tree.value
  function f(node:any): any|null{
    const hit = node.name.toLowerCase().includes(q)
    const kids = (node.children||[]).map(f).filter(Boolean)
    if(hit || kids.length) return { ...node, children: kids }
    return null
  }
  return { roots: tree.value.roots.map(f).filter(Boolean) as any[], byId: tree.value.byId }
})

const children = computed(()=> current.value ? (current.value.children||[]) : tree.value.roots.filter((n:any)=> n.type==='section'))

async function addNode(parentId:string|null=null, type:'section'|'category'='category'){
  try{
    creating.value = true
    const created = await createNode({ parentId, type, name: type==='section'?'Новый раздел':'Новая категория' })
    await load()
    currentId.value = parentId
    editorId.value = created.id
  }catch(e:any){
    console.error('Failed to create node', e)
    alert('Не удалось создать узел каталога. Проверьте, что запущен мок-API (json-server) и VITE_API_URL указывает на него.')
  }finally{
    creating.value = false
  }
}
function openEditor(id:string){ editorId.value = id }
function closeEditor(){ editorId.value = null }
async function saved(){ editorId.value = null; await load() }

const editorNode = computed(()=> editorId.value ? tree.value.byId[editorId.value] : null)
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <!-- Left: tree -->
    <aside class="col-span-12 lg:col-span-4">
      <div class="rounded-xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-4">
        <div class="flex items-center gap-2 mb-2">
          <input v-model="search" placeholder="Поиск..." class="input flex-1" />
        </div>
        <div class="flex items-center gap-2 mb-3">
          <button class="btn" :disabled="creating" @click="addNode(null,'section')">+ Корневой раздел</button>
          <button class="btn" :disabled="creating" @click="current ? addNode(current.id,'category') : addNode(null,'category')">+ Категория</button>
        </div>
        <CatalogTree :nodes="filteredTree.roots" :byId="filteredTree.byId" :maxDepth="4"
                     @select="currentId=$event"
                     @add="(pid, t)=>addNode(pid, t)"
                     @refresh="load" />
      </div>
    </aside>

    <!-- Right: grid -->
    <main class="col-span-12 lg:col-span-8 space-y-4">
      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div class="text-lg font-semibold">{{ current ? current.name : 'Разделы и категории' }}</div>
          <div class="text-sm text-gray-500">Выбрано: {{ current?.name || '—' }}</div>
        </div>
        <NodeGrid :nodes="children" @select="openEditor" @add="current ? addNode(current.id,'category') : addNode(null,'section')" @refresh="load" />
      </div>
    </main>

    <NodeEditorDrawer :node="editorNode" :tree-by-id="tree.byId" :max-depth="4" v-if="editorNode" @close="closeEditor" @saved="saved" />
  </div>
</template>

<style scoped>
.input{ @apply rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full; }
.btn{ @apply inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50; }
</style>

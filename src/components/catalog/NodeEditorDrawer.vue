<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { type CatalogNode, updateNode, deleteNode } from '@/shared/api/catalog'

const props = defineProps<{
  node: CatalogNode | null,
  treeById: Record<string, any>,
  maxDepth?: number
}>()
const emit = defineEmits<{
  (e:'close'):void
  (e:'saved'):void
  (e:'reparent', parentId: string | null):void
}>()

const d = ref<any>(null)
watch(()=>props.node, (n)=>{
  d.value = n ? { ...n, placements:[...(n.placements||[])], seo: { ...(n.seo||{}) } } : null
},{ immediate:true })

const path = computed(()=>{
  if(!d.value) return []
  const res:any[] = []
  let cur = d.value
  while(cur){ res.unshift(cur); cur = cur.parentId ? props.treeById[cur.parentId] : null }
  return res
})

function canMoveTo(pid:string|null){
  if(!d.value) return false
  if(pid===d.value.id) return false
  // depth check
  let depth = 1; let cur = pid ? props.treeById[pid] : null
  while(cur && cur.parentId){ depth++; cur = props.treeById[cur.parentId] }
  return depth < (props.maxDepth || 4)
}

async function save(){
  if(!d.value) return
  await updateNode(d.value.id, {
    name: d.value.name,
    slug: d.value.slug || null,
    icon: d.value.icon || null,
    visibility: !!d.value.visibility,
    placements: d.value.placements || [],
    seo: { title: d.value.seo?.title || null, h1: d.value.seo?.h1 || null, description: d.value.seo?.description || null }
  })
  emit('saved')
}
async function remove(){
  if(!d.value) return
  if(confirm('Удалить этот узел и все вложенные?')){
    // простая каскада: удалить текущий и поддерево
    const stack = [props.treeById[d.value.id]]
    while(stack.length){
      const cur = stack.pop()
      ;(cur.children||[]).forEach((c:any)=>stack.push(c))
      await deleteNode(cur.id)
    }
    emit('saved')
  }
}
async function moveTo(pid:string|null){
  if(!d.value) return
  if(!canMoveTo(pid)){ alert('Слишком глубокая вложенность (макс. 4 уровня)'); return }
  await updateNode(d.value.id, { parentId: pid })
  emit('saved')
}
</script>

<template>
  <div v-if="node" class="drawer">
    <div class="drawer-body">
      <div class="flex items-center justify-between mb-3">
        <div class="text-lg font-semibold">Редактор: {{ d.name }}</div>
        <button class="btn ghost" @click="$emit('close')">Закрыть</button>
      </div>

      <div class="text-xs text-gray-500 mb-2">
        Путь:
        <template v-for="(n,i) in path" :key="n.id">
          <span class="mr-1">{{ n.name }}</span>
          <span v-if="i<path.length-1" class="text-gray-400 mr-1">/</span>
        </template>
      </div>

      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="col-span-2">
            <label class="label">Название</label>
            <input v-model="d.name" class="input" />
          </div>
          <div>
            <label class="label">Иконка</label>
            <input v-model="d.icon" class="input text-center" placeholder="📁" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="label">Slug</label>
            <input v-model="d.slug" class="input" placeholder="url-segment" />
          </div>
          <div>
            <label class="label">Видимость</label>
            <label class="inline-flex items-center gap-2 text-sm h-[38px]">
              <input type="checkbox" v-model="d.visibility">
              Показать на сайте
            </label>
          </div>
        </div>

        <div>
          <label class="label">SEO</label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input v-model="d.seo.title" class="input" placeholder="SEO title" />
            <input v-model="d.seo.h1" class="input" placeholder="H1" />
            <input v-model="d.seo.description" class="input" placeholder="Meta description" />
          </div>
        </div>

        <div>
          <label class="label">Размещения (в разделах)</label>
          <div class="flex flex-wrap gap-2">
            <label v-for="sec in Object.values(treeById).filter((x:any)=>x.type==='section')" :key="sec.id" class="chip">
              <input type="checkbox" class="mr-1" :value="sec.id" v-model="d.placements"> {{ sec.name }}
            </label>
          </div>
          <p class="hint">Категория может отображаться в нескольких разделах как «псевдо-копия» (по аналогии с InSales).</p>
        </div>

        <div>
          <label class="label">Переместить в родителя</label>
          <div class="flex flex-wrap gap-2">
            <button class="btn" @click="moveTo(null)">В корень</button>
            <button class="btn" v-for="sec in Object.values(treeById).filter((x:any)=>x.type==='section')" :key="sec.id" @click="moveTo(sec.id)">{{ sec.name }}</button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn primary" @click="save">Сохранить</button>
          <button class="btn danger" @click="remove">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer{
  position: fixed; top:0; right:0; bottom:0; width: 560px; background: #fff;
  box-shadow: -8px 0 24px rgba(0,0,0,.08); z-index: 50; overflow:auto;
}
.drawer-body{ @apply p-5; }
.label{ @apply text-xs text-gray-500 block mb-1; }
.input{ @apply w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white;}
.btn{ @apply inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50; }
.btn.ghost{ @apply bg-transparent; }
.btn.primary{ @apply border-indigo-500 text-white bg-indigo-600 hover:bg-indigo-700; }
.btn.danger{ @apply border-red-300 text-red-600 hover:bg-red-50; }
.chip{ @apply px-2 py-1 rounded border border-gray-300 text-sm; }
.hint{ @apply text-xs text-gray-500 mt-1; }
</style>

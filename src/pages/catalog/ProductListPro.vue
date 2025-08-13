<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '@/shared/api/client'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { debounce } from '@/shared/utils/debounce'

type Product = {
  id:string; title:string; sku?:string; price:number; status:'active'|'draft'|'archived'; categories?:string[]; updatedAt?:string
}

const route = useRoute()
const router = useRouter()

const q = ref((route.query.q as string) || '')
const status = ref((route.query.status as string) || '')
const categoryId = ref((route.query.categoryId as string) || '')
const priceMin = ref(Number(route.query.min||'') || '')
const priceMax = ref(Number(route.query.max||'') || '')
const page = ref(Number(route.query.page || 1))
const limit = ref(20)

const loading = ref(false)
const items = ref<Product[]>([])
const total = ref(0)
const selected = ref<string[]>([])

const pages = computed(()=> Math.max(1, Math.ceil(total.value/limit.value)))
function applyQuery(){
  router.replace({ query: { q: q.value || undefined, status: status.value || undefined, categoryId: categoryId.value || undefined, min: priceMin.value || undefined, max: priceMax.value || undefined, page: page.value || undefined } })
}

let abort: AbortController | null = null

async function load(){
  loading.value = true
  try {
    abort?.abort()
    abort = new AbortController()
    const params:any = { search: q.value, status: status.value, categoryId: categoryId.value, limit: limit.value, offset: (page.value-1)*limit.value, sort:'updatedAt:desc' }
    if (priceMin.value!=='') params.priceMin = Number(priceMin.value)
    if (priceMax.value!=='') params.priceMax = Number(priceMax.value)
    const { data } = await api.get('/products', { params, signal: abort.signal as any })
    items.value = data?.items || data || []
    total.value = data?.total ?? items.value.length
  } finally { loading.value = false }
}

const debouncedLoad = debounce(load, 250)

onMounted(load)
watch([q,status,categoryId,priceMin,priceMax], () => { page.value = 1; applyQuery(); debouncedLoad() })
watch(page, () => { applyQuery(); load() })

function toggleSelect(id:string){
  const set = new Set(selected.value)
  set.has(id) ? set.delete(id) : set.add(id)
  selected.value = Array.from(set)
}

async function bulkPublish(v:'active'|'draft'|'archived'){
  if (!selected.value.length) return
  // throttle in small batches to avoid hammering API
  const chunk = 10
  for (let i=0;i<selected.value.length;i+=chunk){
    await Promise.all(selected.value.slice(i,i+chunk).map(id => api.patch('/products/'+id, { status: v })))
  }
  selected.value = []
  await load()
}

async function bulkDelete(){
  if (!selected.value.length) return
  if (!confirm('Удалить выбранные товары?')) return
  const chunk = 10
  for (let i=0;i<selected.value.length;i+=chunk){
    await Promise.all(selected.value.slice(i,i+chunk).map(id => (api.delete as any)?.('/products/'+id)).filter(Boolean))
  }
  selected.value = []
  await load()
}

async function inlinePrice(id:string, e: Event){
  const value = Number((e.target as HTMLInputElement).value)
  await api.patch('/products/'+id, { price: value })
}
async function inlineStatus(id:string, e: Event){
  const v = (e.target as HTMLSelectElement).value as any
  await api.patch('/products/'+id, { status: v })
  await load()
}

function onCsvImport(e: Event){
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async () => {
    const text = String(reader.result || '')
    const rows = text.split(/\r?\n/).map(r=>r.trim()).filter(Boolean)
    for (const r of rows){
      const [sku, title, price] = r.split(/[,;\t]/).map(s=>s.trim())
      if (!title) continue
      try { await api.post('/products', { sku, title, price: Number(price)||0, status:'draft' }) } catch {}
    }
    await load()
  }
  reader.readAsText(file, 'utf-8')
  ;(e.target as HTMLInputElement).value=''
}
</script>

<template>
  <div class="space-y-4 p-4">
    <div class="flex flex-wrap items-end gap-2">
      <label class="block">
        <div class="text-xs text-gray-600 mb-1">Поиск</div>
        <input v-model.trim="q" class="input" placeholder="Название или SKU…" />
      </label>
      <label class="block">
        <div class="text-xs text-gray-600 mb-1">Статус</div>
        <select v-model="status" class="select">
          <option value="">— любой —</option>
          <option value="active">Опубликован</option>
          <option value="draft">Черновик</option>
          <option value="archived">Архив</option>
        </select>
      </label>
      <label class="block">
        <div class="text-xs text-gray-600 mb-1">Категория</div>
        <input v-model="categoryId" class="input" placeholder="ID категории…" />
      </label>
      <label class="block">
        <div class="text-xs text-gray-600 mb-1">Цена от</div>
        <input v-model="priceMin" class="input w-32" type="number" min="0" step="0.01" />
      </label>
      <label class="block">
        <div class="text-xs text-gray-600 mb-1">до</div>
        <input v-model="priceMax" class="input w-32" type="number" min="0" step="0.01" />
      </label>
      <div class="ml-auto flex gap-2">
        <label class="btn">
          Импорт CSV
          <input type="file" class="hidden" accept=".csv,text/csv" @change="onCsvImport" />
        </label>
        <RouterLink class="btn" to="/catalog/products/new">+ Новый товар</RouterLink>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button class="btn" :disabled="!selected.length" @click="bulkPublish('active')">Опубликовать</button>
      <button class="btn" :disabled="!selected.length" @click="bulkPublish('draft')">Сделать черновиком</button>
      <button class="btn" :disabled="!selected.length" @click="bulkPublish('archived')">В архив</button>
      <button class="btn" :disabled="!selected.length" @click="bulkDelete">Удалить</button>
      <div class="text-sm text-gray-500" v-if="selected.length">Выбрано: {{ selected.length }}</div>
    </div>

    <div class="card divide-y">
      <div class="row head">
        <div class="cell w-8"></div>
        <div class="cell grow">Название</div>
        <div class="cell w-40">SKU</div>
        <div class="cell w-40">Цена</div>
        <div class="cell w-40">Статус</div>
        <div class="cell w-48">Обновлён</div>
      </div>
      <div v-for="p in items" :key="p.id" class="row">
        <div class="cell w-8"><input type="checkbox" :checked="selected.includes(p.id)" @change="toggleSelect(p.id)" /></div>
        <div class="cell grow">
          <RouterLink class="link" :to="'/catalog/products/'+p.id">{{ p.title }}</RouterLink>
        </div>
        <div class="cell w-40">{{ p.sku }}</div>
        <div class="cell w-40">
          <input :value="p.price" type="number" min="0" step="0.01" class="input w-36" @change="inlinePrice(p.id, $event)" />
        </div>
        <div class="cell w-40">
          <select :value="p.status" class="select w-36" @change="inlineStatus(p.id, $event)">
            <option value="active">Опубликован</option>
            <option value="draft">Черновик</option>
            <option value="archived">Архив</option>
          </select>
        </div>
        <div class="cell w-48">{{ new Date(p.updatedAt||'').toLocaleString() }}</div>
      </div>
      <div v-if="!items.length && !loading" class="p-6 text-sm text-gray-500">Нет данных</div>
    </div>

    <div class="flex justify-between items-center">
      <div class="text-sm text-gray-500">Всего: {{ total }}</div>
      <div class="flex gap-1">
        <button class="btn" :disabled="page<=1" @click="page--">Назад</button>
        <div class="px-2 py-1 text-sm">стр. {{ page }} / {{ pages }}</div>
        <button class="btn" :disabled="page>=pages" @click="page++">Вперёд</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input{ @apply rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500; }
.select{ @apply rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white; }
.btn{ @apply inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50; }
.link{ @apply text-indigo-600 hover:underline; }
.card{ @apply rounded-xl border border-gray-200 bg-white shadow-sm; }
.row{ @apply flex items-center px-3 py-2; }
.head{ @apply bg-gray-50 font-medium text-sm; }
.cell{ @apply px-2; }
</style>

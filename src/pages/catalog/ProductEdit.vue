<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/shared/api/client'
import RichText from '@/components/common/RichText.vue'
import MediaGallery from '@/components/media/MediaGallery.vue'
import CategoryPicker from '@/components/products/CategoryPicker.vue'

type MediaItem = { id:string; url:string; cover?:boolean; alt?:string }
type Product = {
  id?: string
  title: string
  description?: string
  descriptionExtra?: string
  price?: number
  priceOld?: number
  cost?: number
  status?: 'active'|'draft'|'archived'
  sku?: string
  categories?: string[]
  placements?: { site:boolean, warehouse:boolean, paths?: string[] }
  stocks?: Record<string, number>
  media?: MediaItem[]
  videoUrl?: string
}

const route = useRoute()
const router = useRouter()
const id = computed(()=> route.params.id as string | undefined)
const loading = ref(false)
const saving = ref(false)

const model = reactive<Product>({
  title: '',
  status: 'draft',
  price: 0,
  priceOld: 0,
  cost: 0,
  categories: [],
  placements: { site: true, warehouse: false, paths: [] },
  stocks: { 'МСК': 0, 'СПБ': 0, 'WB': 0 },
  media: []
})

async function load(){
  if(!id.value) return
  loading.value = true
  try{
    const { data } = await api.get('/products/'+id.value)
    Object.assign(model, { stocks: { 'МСК': 0, 'СПБ': 0, 'WB': 0 }, ...data })
    // гарантируем наличие ключей
    model.stocks = Object.assign({ 'МСК': 0, 'СПБ': 0, 'WB': 0 }, model.stocks || {})
  } finally { loading.value = false }
}

onMounted(load)

async function save(){
  saving.value = true
  try {
    if (id.value) {
      await api.patch('/products/'+id.value, model)
    } else {
      const { data } = await api.post('/products', model)
      if (data?.id) await router.replace({ name:'product-edit', params:{ id:data.id } })
    }
    alert('Сохранено')
  } finally { saving.value = false }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">{{ id ? 'Редактирование товара' : 'Новый товар' }}</h1>
      <div class="flex gap-2">
        <button class="btn" @click="router.push('/catalog/products')">Назад к списку</button>
        <button class="btn" :disabled="saving" @click="save">Сохранить</button>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12 xl:col-span-8 space-y-6">
        <div class="card p-4 space-y-3">
          <label class="block">
            <div class="lbl">Наименование *</div>
            <input v-model="model.title" class="input" placeholder="Введите название" />
          </label>

          <div>
            <div class="lbl">Описание</div>
            <RichText v-model="model.description" placeholder="Укажите главные особенности, характеристики и ключевые слова…" />
          </div>

          <label class="flex items-center gap-2 mt-2">
            <input type="checkbox" v-model="model.descriptionExtra" true-value="on" false-value="" />
            <span class="text-sm text-gray-700">Дополнительное описание</span>
          </label>
          <div v-if="model.descriptionExtra">
            <RichText v-model="model.descriptionExtra" placeholder="Коротко перечислите основные преимущества товара…" />
          </div>
        </div>

        <div class="card p-4">
          <div class="lbl mb-3">Медиа</div>
          <MediaGallery v-model="model.media" />
          <div class="mt-2">
            <button class="link" @click="model.videoUrl = model.videoUrl || ''">Добавить ссылку на видео</button>
            <div v-if="typeof model.videoUrl === 'string'" class="mt-2">
              <input v-model="model.videoUrl" class="input" placeholder="https://youtu.be/..." />
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 xl:col-span-4 space-y-6">
        <div class="card p-4 space-y-3">
          <label class="block">
            <div class="lbl">Статус</div>
            <select v-model="model.status" class="select">
              <option value="active">Показывать</option>
              <option value="draft">Черновик</option>
              <option value="archived">Архив</option>
            </select>
          </label>

          <label class="block">
            <div class="lbl">SKU</div>
            <input v-model="model.sku" class="input" />
          </label>

          <div>
            <div class="lbl">Цены</div>
            <div class="grid grid-cols-3 gap-2">
              <input v-model.number="model.price" type="number" class="input" placeholder="Цена" />
              <input v-model.number="model.priceOld" type="number" class="input" placeholder="Цена до скидки" />
              <input v-model.number="model.cost" type="number" class="input" placeholder="Закупочная" />
            </div>
          </div>
        </div>

        <div class="card p-4">
          <div class="lbl mb-2">Расположение</div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">На сайте</span>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="model.placements!.site" />
              <span class="text-sm">Показывать</span>
            </label>
          </div>
          <div class="mt-3">
            <CategoryPicker v-model="model.categories" />
          </div>
        </div>

        <div class="card p-4">
          <div class="lbl mb-2">Остатки</div>
          <div class="grid grid-cols-2 gap-2">
            <label class="block">
              <div class="text-xs text-gray-600 mb-1">МСК</div>
              <input v-model.number="model.stocks['МСК']" type="number" class="input" />
            </label>
            <label class="block">
              <div class="text-xs text-gray-600 mb-1">СПБ</div>
              <input v-model.number="model.stocks['СПБ']" type="number" class="input" />
            </label>
            <label class="block col-span-2">
              <div class="text-xs text-gray-600 mb-1">Insales (Wildberries)</div>
              <input v-model.number="model.stocks['WB']" type="number" class="input" />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card{ @apply rounded-xl border border-gray-200 bg-white shadow-sm; }
.input{ @apply rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full bg-white; }
.select{ @apply rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full; }
.lbl{ @apply text-xs text-gray-600 mb-1; }
.btn{ @apply inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50; }
.link{ @apply text-indigo-600 hover:underline text-sm; }
</style>

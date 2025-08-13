<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/shared/api/client'
import RichText from '@/components/editor/RichText.vue'
import MediaUploader from '@/components/uploader/MediaUploader.vue'
import Modal from '@/components/ui/Modal.vue'

type MediaItem = { id: string; url: string; isPrimary?: boolean; name?: string }
type Product = {
  id?: string;
  title: string;
  sku?: string;
  price: number;
  compareAt?: number|null;
  cost?: number|null;
  status: 'draft'|'active'|'archived';
  description?: string;
  extraEnabled?: boolean;
  extraDescription?: string;
  media?: MediaItem[];
  showOnSite?: boolean;
  categories?: string[];
  data?: { currency: string; discountAllowed: boolean; unit: string; vat: number };
}

const route = useRoute()
const router = useRouter()
const isNew = computed(()=> route.params.id === 'new')

const model = ref<Product>({
  title: '',
  sku: '',
  price: 0,
  compareAt: null,
  cost: null,
  status: 'draft',
  description: '',
  extraEnabled: false,
  extraDescription: '',
  media: [],
  showOnSite: true,
  categories: [],
  data: { currency: 'RUB', discountAllowed: true, unit: 'шт', vat: 10 }
})
const saving = ref(false)
const lastSavedAt = ref<string|null>(null)
const categories = ref<{ id:string; name:string }[]>([])
const settingsOpen = ref(false)
const placeOpen = ref(false)

async function load(){
  try{
    const { data: cats } = await api.get('/categories')
    categories.value = cats || []
  }catch{}
  if (isNew.value) return
  const { data } = await api.get('/products/' + route.params.id)
  model.value = { data: { currency:'RUB', discountAllowed:true, unit:'шт', vat:10 }, showOnSite:true, extraEnabled:false, media:[], categories:[], ...data }
}

async function save(){
  saving.value = true
  try{
    if (isNew.value){
      const { data } = await api.post('/products', model.value)
      router.replace('/catalog/products/' + data.id)
    } else {
      const { data } = await api.patch('/products/' + route.params.id, model.value)
      model.value = data
    }
    lastSavedAt.value = new Date().toLocaleTimeString()
  } finally { saving.value = false }
}

// autosave (existing items only)
let timer: number|undefined
watch(model, ()=>{
  if (isNew.value) return
  clearTimeout(timer)
  timer = window.setTimeout(()=> save(), 1200)
}, { deep: true })

onMounted(load)

function toggleExtra(){ model.value.extraEnabled = !model.value.extraEnabled }
function openSettings(){ settingsOpen.value = true }
function openPlacement(){ placeOpen.value = true }

function formatCurrency(n?: number|null){
  if (n===null || n===undefined) return ''
  try { return new Intl.NumberFormat('ru-RU', { style:'currency', currency: model.value.data?.currency || 'RUB' }).format(n) } catch { return String(n) }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">{{ isNew ? 'Новый товар' : 'Товар' }}</h1>
      <div class="text-sm text-gray-500" v-if="lastSavedAt">Сохранено в {{ lastSavedAt }}</div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: main form -->
      <div class="lg:col-span-2 space-y-6">
        <div class="card p-4 space-y-4">
          <label class="block">
            <div class="mb-1 text-sm font-medium">Наименование *</div>
            <input v-model="model.title" class="input" placeholder="Название товара" />
          </label>

          <div>
            <div class="mb-1 text-sm font-medium">Описание</div>
            <RichText v-model="model.description" placeholder="Укажите главные особенности..." helper="PRESS ALT+0 FOR HELP 0 WORDS" />
          </div>

          <div>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="model.extraEnabled" />
              <span class="text-sm font-medium">Дополнительное описание</span>
            </label>
            <div v-if="model.extraEnabled" class="mt-2">
              <RichText v-model="model.extraDescription" placeholder="Коротко перечислите преимущества товара..." />
            </div>
          </div>
        </div>

        <div class="card p-4">
          <div class="mb-2 flex items-center justify-between">
            <div class="text-sm font-medium">Медиа</div>
          </div>
          <MediaUploader v-model="model.media" />
        </div>

        <div class="card p-4">
          <div class="text-sm font-medium mb-3">Цены</div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <label class="block">
              <div class="mb-1 text-sm">Цена *</div>
              <input v-model.number="model.price" type="number" min="0" step="0.01" class="input" placeholder="0.00" />
            </label>
            <label class="block">
              <div class="mb-1 text-sm">Цена до скидки</div>
              <input v-model.number="model.compareAt" type="number" min="0" step="0.01" class="input" placeholder="0.00" />
            </label>
            <label class="block">
              <div class="mb-1 text-sm">Цена закупки</div>
              <input v-model.number="model.cost" type="number" min="0" step="0.01" class="input" placeholder="0.00" />
            </label>
          </div>
          <div class="mt-2 text-xs text-gray-500">Текущая цена: <b>{{ formatCurrency(model.price) }}</b></div>
        </div>
      </div>

      <!-- Right: side panels -->
      <div class="space-y-6">
        <div class="card p-4">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium">Расположение</div>
          </div>
          <div class="mt-3 space-y-3">
            <label class="flex items-center justify-between">
              <span class="text-sm">На сайте</span>
              <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="model.showOnSite" class="sr-only peer">
                <div class="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-indigo-500 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </label>
            <div class="text-xs text-gray-500">В каких категориях товар будет показан на сайте.</div>
            <button class="text-sm text-indigo-600 hover:underline" @click="openPlacement">Выбрать размещение</button>

            <div v-if="model.categories?.length" class="text-xs text-gray-700">
              Выбрано: {{ model.categories.join(', ') }}
            </div>
          </div>
        </div>

        <div class="card p-4">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium">Данные товара</div>
            <button class="text-sm text-indigo-600 hover:underline" @click="openSettings">Настроить</button>
          </div>
          <dl class="mt-3 text-sm">
            <div class="flex justify-between py-1"><dt class="text-gray-500">Валюта:</dt><dd>{{ model.data?.currency }}</dd></div>
            <div class="flex justify-between py-1"><dt class="text-gray-500">Применять скидки:</dt><dd>{{ model.data?.discountAllowed ? 'Да' : 'Нет' }}</dd></div>
            <div class="flex justify-between py-1"><dt class="text-gray-500">Ед. изм.:</dt><dd>{{ model.data?.unit }}</dd></div>
            <div class="flex justify-between py-1"><dt class="text-gray-500">НДС:</dt><dd>{{ model.data?.vat }}%</dd></div>
          </dl>
        </div>

        <div class="flex gap-2">
          <button class="btn" @click="save" :disabled="saving">{{ saving ? 'Сохранение…' : (isNew ? 'Создать' : 'Сохранить') }}</button>
          <RouterLink class="btn" to="/catalog/products">Отмена</RouterLink>
        </div>
      </div>
    </div>

    <!-- Settings modal -->
    <Modal :open="settingsOpen" title="Настройки товара" @close="settingsOpen=false">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="block">
          <div class="mb-1 text-sm">Валюта</div>
          <select v-model="model.data!.currency" class="select">
            <option value="RUB">Российский рубль (руб)</option>
            <option value="USD">Доллар США (USD)</option>
            <option value="EUR">Евро (EUR)</option>
          </select>
        </label>
        <label class="block">
          <div class="mb-1 text-sm">Единица измерения</div>
          <select v-model="model.data!.unit" class="select">
            <option value="шт">шт</option>
            <option value="кг">кг</option>
            <option value="л">л</option>
          </select>
        </label>
        <label class="block">
          <div class="mb-1 text-sm">НДС</div>
          <select v-model.number="model.data!.vat" class="select">
            <option :value="0">0%</option>
            <option :value="10">10%</option>
            <option :value="20">20%</option>
          </select>
        </label>
        <label class="block">
          <div class="mb-1 text-sm">Применять скидки</div>
          <select v-model="model.data!.discountAllowed" class="select">
            <option :value="true">Да</option>
            <option :value="false">Нет</option>
          </select>
        </label>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <button class="btn" @click="settingsOpen=false">Готово</button>
        </div>
      </template>
    </Modal>

    <!-- Placement modal -->
    <Modal :open="placeOpen" title="Размещение в категориях" @close="placeOpen=false">
      <div class="space-y-2">
        <div v-for="c in categories" :key="c.id" class="flex items-center gap-2">
          <input type="checkbox" :value="c.id" v-model="model.categories" />
          <span class="text-sm">{{ c.name }}</span>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <button class="btn" @click="placeOpen=false">Готово</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.card{ @apply rounded-xl border border-gray-200 bg-white shadow-sm; }
.input{ @apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500; }
.select{ @apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500; }
.btn{ @apply inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50; }
</style>

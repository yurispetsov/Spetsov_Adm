<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/shared/api/client'
import VariantsMatrix from '@/components/products/VariantsMatrix.vue'

type Variant = { id:string; sku:string; name:string; price:number; stock:number; active:boolean; image?: string|null; attrs:{a:string,b:string} }
type Product = any

const route = useRoute()
const router = useRouter()
const product = ref<Product|null>(null)
const variants = ref<Variant[]>([])

async function load(){
  const { data } = await api.get('/products/' + route.params.id)
  product.value = data
  variants.value = data.variants || []
}
onMounted(load)

async function save(){
  if (!product.value) return
  await api.patch('/products/' + route.params.id, { variants: variants.value, price: product.value.price, stock: product.value.stock })
  router.push('/catalog/products/' + route.params.id)
}
</script>

<template>
  <div class="p-4 space-y-4" v-if="product">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Варианты: {{ product.title }}</h1>
      <div class="flex gap-2">
        <RouterLink class="btn" :to="'/catalog/products/'+product.id">← К карточке товара</RouterLink>
        <button class="btn" @click="save">Сохранить</button>
      </div>
    </div>

    <VariantsMatrix v-model="variants" :base-sku="product.sku" @syncTotals="(p)=>{ product.price=p.price; product.stock=p.stock }" />
  </div>
  <div v-else class="p-4 text-sm text-gray-500">Загрузка…</div>
</template>

<style scoped>
.btn{ @apply inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50; }
</style>

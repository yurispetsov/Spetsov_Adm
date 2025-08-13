<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <label class="block">
        <div class="text-xs text-gray-600 mb-1">Атрибут A</div>
        <input v-model="aRaw" class="input" placeholder="Напр.: Цвет (Красный, Синий)" />
      </label>
      <label class="block">
        <div class="text-xs text-gray-600 mb-1">Атрибут B</div>
        <input v-model="bRaw" class="input" placeholder="Напр.: Размер (S, M, L)" />
      </label>
      <div class="flex items-end gap-2">
        <button class="btn" @click="generate">Сгенерировать варианты</button>
        <button class="btn" @click="clear">Очистить</button>
      </div>
    </div>

    <div v-if="rows.length===0" class="text-sm text-gray-500">Добавьте варианты — введите значения атрибутов через запятую.</div>

    <div v-else class="overflow-auto">
      <table class="min-w-[720px] w-full border rounded-lg">
        <thead class="bg-gray-50">
          <tr>
            <th class="th">#</th>
            <th class="th">SKU</th>
            <th class="th">Вариант</th>
            <th class="th">Цена</th>
            <th class="th">Остаток</th>
            <th class="th">Фото</th>
            <th class="th">Показывать</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(v, i) in rows" :key="v.id">
            <td class="td">{{ i+1 }}</td>
            <td class="td"><input v-model="v.sku" class="input w-40" /></td>
            <td class="td text-left">
              <div class="text-sm">{{ v.name }}</div>
              <div class="text-xs text-gray-500">{{ v.attrs.a }} / {{ v.attrs.b }}</div>
            </td>
            <td class="td"><input v-model.number="v.price" type="number" min="0" step="0.01" class="input w-28" /></td>
            <td class="td"><input v-model.number="v.stock" type="number" min="0" step="1" class="input w-24" /></td>
            <td class="td">
              <div class="flex items-center gap-2">
                <img v-if="v.image" :src="v.image" class="w-10 h-10 object-cover rounded border" />
                <input type="file" accept="image/*" @change="pick(i, $event)" />
              </div>
            </td>
            <td class="td"><input type="checkbox" v-model="v.active" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center gap-2">
      <button class="btn" @click="applyToProduct">Сохранить в товар</button>
      <div class="text-xs text-gray-500">Итоговый остаток товара будет равен сумме активных вариантов.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

type Variant = {
  id:string; sku:string; name:string; price:number; stock:number; active:boolean; image?: string|null;
  attrs: { a: string; b: string }
}
const props = defineProps<{ modelValue: Variant[]|undefined; baseSku?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: Variant[]): void, (e:'syncTotals', payload:{ price:number, stock:number }): void }>()

const rows = ref<Variant[]>(props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [])
watch(()=>props.modelValue, (v)=> rows.value = v ? JSON.parse(JSON.stringify(v)) : [])

const aRaw = ref(''), bRaw = ref('')
function parseLine(s:string){ return s.split(/[;,]/).map(x=>x.trim()).filter(Boolean) }

function generate(){
  const A = parseLine(aRaw.value)
  const B = parseLine(bRaw.value)
  const out: Variant[] = []
  let i=1
  for (const a of (A.length?A:[''])){
    for (const b of (B.length?B:[''])){
      const skupart = (props.baseSku||'SKU').replace(/\s+/g,'').toUpperCase()
      const sku = `${skupart}-${String(i).padStart(3,'0')}`
      out.push({ id: crypto.randomUUID(), sku, name:`${a}${a&&b?' / ':''}${b}`, price: 0, stock: 0, active: true, attrs: { a, b } })
      i++
    }
  }
  rows.value = out
}

function clear(){ rows.value = [] }

function pick(i:number, e: Event){
  const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = ()=> { rows.value[i].image = String(reader.result) }
  reader.readAsDataURL(file)
}

function applyToProduct(){
  emit('update:modelValue', rows.value)
  const totalStock = rows.value.filter(v=>v.active).reduce((s,v)=> s + (Number(v.stock)||0), 0)
  const minPrice = rows.value.filter(v=>v.active).reduce((m,v)=> Math.min(m, Number(v.price)||m ), Number.MAX_SAFE_INTEGER)
  emit('syncTotals', { price: isFinite(minPrice) ? minPrice : 0, stock: totalStock })
}
</script>

<style scoped>
.input{ @apply rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500; }
.btn{ @apply inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50; }
.th{ @apply px-3 py-2 text-sm border-b; }
.td{ @apply px-3 py-2 text-sm border-b text-center; }
</style>

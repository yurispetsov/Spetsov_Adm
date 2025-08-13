<template>
  <div class="flex flex-col h-full">
    <div class="p-3 border-b flex gap-2 items-center">
      <input :value="q" @input="$emit('update:q', ($event.target as HTMLInputElement).value)" class="border rounded px-3 py-2 flex-1" placeholder="Поиск..." />
      <button class="border rounded px-3 py-2" @click="$emit('create')">Создать</button>
    </div>
    <div class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 border-b">
          <tr>
            <th class="p-2 text-left w-56">{{ kind==='promos' ? 'Промокод' : 'Название' }}</th>
            <th class="p-2 text-left w-28">Тип</th>
            <th class="p-2 text-right w-24">Значение</th>
            <th class="p-2 text-left w-28">Оплата</th>
            <th class="p-2 text-left w-32">Получение</th>
            <th class="p-2 text-left">Ограничения</th>
            <th class="p-2 text-right w-28"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="x in items" :key="x.id" class="border-b hover:bg-gray-50">
            <td class="p-2">
              <div class="font-medium">{{ (x as any).code || x.name }}</div>
              <div class="opacity-70" v-if="(x as any).name && (x as any).code">{{ (x as any).name }}</div>
              <div class="opacity-70" v-if="kind!=='promos'">{{ (x as any).name }}</div>
            </td>
            <td class="p-2">{{ typeLabel(x.kind) }}</td>
            <td class="p-2 text-right">
              <span v-if="x.kind==='percent'">{{ x.value ?? '—' }}%</span>
              <span v-else-if="x.kind==='amount'">{{ money(x.value||0) }}</span>
              <span v-else>—</span>
            </td>
            <td class="p-2">{{ payLabel((x.payment||'all') as any) }}</td>
            <td class="p-2">{{ delivLabel((x.delivery||'all') as any) }}</td>
            <td class="p-2">
              <span class="opacity-70" v-if="x.validFrom || x.validTo">Срок: {{ date(x.validFrom) }}–{{ date(x.validTo) }}</span>
              <span class="opacity-70" v-if="x.groupKeys?.length"> • Группы: {{ x.groupKeys.join(', ') }}</span>
              <span class="opacity-70" v-if="x.clientIds?.length"> • Клиенты: {{ x.clientIds.length }}</span>
            </td>
            <td class="p-2 text-right">
              <button class="underline text-xs mr-2" @click="$emit('edit', x)">Изменить</button>
              <button class="underline text-red-600 text-xs" @click="$emit('remove', x.id)">Удалить</button>
            </td>
          </tr>
          <tr v-if="!items.length"><td colspan="7" class="p-6 text-center opacity-70">Нет записей</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { Discount, PromoCode } from '@/api/discounts'
import { listPaymentMethods, discountKinds } from '@/api/discounts'

const props = defineProps<{ kind: 'promos'|'discounts', rows: (PromoCode|Discount)[], q: string }>()
const emit = defineEmits(['edit','remove','create','update:q'])

const items = computed(()=>{
  const v = (props.q||'').toLowerCase()
  return !v ? props.rows : props.rows.filter(x => ((x as any).code || (x as any).name || '').toLowerCase().includes(v))
})

const q = computed(()=> props.q)

function date(iso?: string){ return iso ? new Date(iso).toLocaleDateString('ru-RU') : '—' }
function money(v: number){ return new Intl.NumberFormat('ru-RU', { style:'currency', currency:'RUB', maximumFractionDigits: 0 }).format(v || 0) }
function typeLabel(k: any){ const f = discountKinds().find(x=>x.key===k); return f?f.name:k }
function payLabel(k: any){ if(k==='all') return 'Любая'; const f = listPaymentMethods().find(x=>x.key===k); return f?f.name:k }
function delivLabel(k: any){ if(k==='all') return 'Любой'; return k==='pickup'?'Самовывоз':'Доставка' }
</script>

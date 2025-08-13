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
            <th class="p-2 text-left w-48">Ключ</th>
            <th class="p-2 text-left">Название</th>
            <th class="p-2 text-right w-28">+%</th>
            <th class="p-2 text-right w-28">-%</th>
            <th class="p-2 text-left w-24">Статус</th>
            <th class="p-2 text-right w-32"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="x in items" :key="x.id" class="border-b hover:bg-gray-50">
            <td class="p-2">{{ x.key }}</td>
            <td class="p-2">{{ x.name }}</td>
            <td class="p-2 text-right">{{ x.markupPercent ?? '—' }}</td>
            <td class="p-2 text-right">{{ x.discountPercent ?? '—' }}</td>
            <td class="p-2"><span :class="x.active ? 'text-green-700' : 'text-gray-500'">{{ x.active ? 'Активен' : 'Выключен' }}</span></td>
            <td class="p-2 text-right">
              <button class="underline text-xs mr-2" @click="$emit('edit', x)">Изменить</button>
              <button class="underline text-red-600 text-xs" @click="$emit('remove', x.id)">Удалить</button>
            </td>
          </tr>
          <tr v-if="!items.length"><td colspan="6" class="p-6 text-center opacity-70">Нет записей</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { PriceType } from '@/api/discounts'

const props = defineProps<{ rows: PriceType[], q: string }>()
const emit = defineEmits(['edit','remove','create','update:q'])

const items = computed(()=>{
  const v = (props.q||'').toLowerCase()
  return !v ? props.rows : props.rows.filter(x => (x.key+' '+x.name).toLowerCase().includes(v))
})
const q = computed(()=> props.q)
</script>

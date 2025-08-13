<template>
  <div class="flex flex-col h-full">
    <div class="p-3 border-b grid grid-cols-12 items-center gap-2">
      <input v-model="q" placeholder="Поиск (имя, ИНН, e-mail, телефон…)" class="border rounded px-3 py-2 col-span-6" />
      <select v-model="active" class="border rounded px-3 py-2 col-span-2">
        <option :value="null">Все</option>
        <option :value="true">Активные</option>
        <option :value="false">Неактивные</option>
      </select>
      <div class="col-span-4 text-right">
        <button class="border rounded px-3 py-2" @click="$emit('create')">+ Создать</button>
      </div>
    </div>
    <div class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 border-b">
          <tr>
            <th class="text-left p-2">#</th>
            <th class="text-left p-2" v-if="type==='legal'">Наименование / ИНН</th>
            <th class="text-left p-2" v-else>ФИО</th>
            <th class="text-left p-2">Контакты</th>
            <th class="text-left p-2 w-32">Статус</th>
            <th class="text-right p-2 w-48">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c,i) in items" :key="c.id" class="border-b hover:bg-gray-50">
            <td class="p-2">{{ i+1 }}</td>
            <td class="p-2" v-if="type==='legal'">
              <div class="font-medium truncate">{{ (c as any).name }}</div>
              <div class="opacity-70">ИНН: {{ (c as any).inn || '—' }}</div>
            </td>
            <td class="p-2" v-else>
              <div class="font-medium truncate">{{ (c as any).lastName }} {{ (c as any).firstName }} {{ (c as any).middleName }}</div>
              <div class="opacity-70">{{ (c as any).birthDate || '—' }}</div>
            </td>
            <td class="p-2">
              <div class="opacity-80" v-if="type==='legal'">{{ ((c as any).emails||[]).join(', ') || '—' }}</div>
              <div class="opacity-80" v-else>{{ (c as any).email || '—' }}</div>
              <div class="opacity-80">{{ type==='legal' ? ((c as any).phones||[]).join(', ') : (c as any).phone || '—' }}</div>
            </td>
            <td class="p-2">
              <span :class="c.isActive ? 'text-green-700' : 'text-gray-500'">{{ c.isActive ? 'Активен' : 'Неактивен' }}</span>
            </td>
            <td class="p-2 text-right space-x-2">
              <button class="text-indigo-700 underline" @click="$emit('edit', c)">Изменить</button>
              <button class="text-red-600 underline" @click="$emit('remove', c.id)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Client, ClientType } from '@/api/clients'
const props = defineProps<{ items: Client[]; type: ClientType }>()

const emit = defineEmits(['create','edit','remove','set-filter'])
const q = ref(''); const active = ref<boolean|null>(null)
watch([q,active], () => emit('set-filter', { q: q.value, isActive: active.value }), { immediate: true })
</script>

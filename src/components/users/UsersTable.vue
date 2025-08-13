<template>
  <div class="flex flex-col h-full">
    <div class="p-3 border-b grid grid-cols-12 gap-2 items-center">
      <input :value="q" @input="$emit('update:q', ($event.target as HTMLInputElement).value)" class="border rounded px-3 py-2 col-span-5" placeholder="Поиск по имени/почте" />
      <select :value="role" @change="$emit('update:role', ($event.target as HTMLSelectElement).value)" class="border rounded px-3 py-2 col-span-3">
        <option value="all">Все роли</option>
        <option v-for="r in roleTemplates" :key="r.key" :value="r.key">{{ r.name }}</option>
      </select>
      <select :value="active" @change="$emit('update:active', ($event.target as HTMLSelectElement).value)" class="border rounded px-3 py-2 col-span-2">
        <option value="all">Все</option>
        <option value="active">Активные</option>
        <option value="inactive">Выключенные</option>
      </select>
      <select :value="sort" @change="$emit('update:sort', ($event.target as HTMLSelectElement).value)" class="border rounded px-3 py-2 col-span-1">
        <option value="name">Имя</option>
        <option value="last">Вход</option>
        <option value="status">Статус</option>
      </select>
      <div class="text-right col-span-1">
        <button class="border rounded px-3 py-2" @click="$emit('create')">Создать</button>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-gray-50 border-b">
          <tr>
            <th class="p-2 w-8"></th>
            <th class="p-2 text-left w-64">Пользователь</th>
            <th class="p-2 text-left w-36">Роль</th>
            <th class="p-2 text-left w-48">Последний вход</th>
            <th class="p-2 text-left w-28">Статус</th>
            <th class="p-2 text-left w-28">Активен</th>
            <th class="p-2 text-right w-28"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="u in items" :key="u.id">
            <tr class="border-b hover:bg-gray-50">
              <td class="p-2 align-top">
                <button class="w-6 h-6 rounded border leading-none" @click="toggle(u.id)">
                  {{ expanded.has(u.id) ? '▾' : '▸' }}
                </button>
              </td>
              <td class="p-2 align-top">
                <div class="font-medium">{{ u.name || u.email }}</div>
                <div class="opacity-70">{{ u.email }}</div>
              </td>
              <td class="p-2 align-top">{{ roleName(u.role) }}</td>
              <td class="p-2 align-top"><div>{{ dateTime(u.lastLoginAt) }}</div></td>
              <td class="p-2 align-top">
                <span :class="isOnline(u) ? 'text-green-700' : 'text-gray-500'">{{ isOnline(u) ? 'Онлайн' : 'Оффлайн' }}</span>
              </td>
              <td class="p-2 align-top">
                <input type="checkbox" :checked="u.isActive" @change="$emit('toggle', u.id, ($event.target as HTMLInputElement).checked)" />
              </td>
              <td class="p-2 text-right align-top">
                <button class="underline text-xs mr-2" @click="$emit('edit', u)">Изменить</button>
                <button class="underline text-red-600 text-xs" @click="$emit('remove', u.id)">Удалить</button>
              </td>
            </tr>
            <tr v-if="expanded.has(u.id)" class="bg-gray-50/50">
              <td></td>
              <td class="p-2" colspan="6">
                <div class="text-xs font-medium mb-2">Права доступа</div>
                <table class="text-xs w-full">
                  <thead>
                    <tr class="opacity-70">
                      <th class="text-left p-1">Раздел</th>
                      <th class="text-left p-1">Чтение</th>
                      <th class="text-left p-1">Редактирование</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in u.permissions" :key="p.page">
                      <td class="p-1">{{ resName(p.page) }}</td>
                      <td class="p-1">{{ p.read ? 'Да' : 'Нет' }}</td>
                      <td class="p-1">{{ p.write ? 'Да' : 'Нет' }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </template>
          <tr v-if="!items.length"><td colspan="7" class="p-6 text-center opacity-70">Нет пользователей</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { User } from '@/api/users'
import { listRoleTemplates, listResources } from '@/api/users'

const props = defineProps<{ items: User[], q: string, role: any, active: any, sort?: string }>()
const emit = defineEmits(['update:q','update:role','update:active','update:sort','toggle','create','edit','remove'])

const roleTemplates = listRoleTemplates()
const resources = listResources()

function roleName(k: any){ const f = roleTemplates.find(r=>r.key===k); return f?f.name:k }
function resName(k: any){ const f = resources.find(r=>r.key===k); return f?f.name:k }

const items = computed(()=> props.items)
const q = computed(()=> props.q)
const role = computed(()=> props.role)
const active = computed(()=> props.active)
const sort = computed(()=> props.sort || 'name')

// expand
const expanded = ref(new Set<string>())
function toggle(id: string){ expanded.value.has(id) ? expanded.value.delete(id) : expanded.value.add(id) }

function dateTime(iso?: string){ return iso ? new Date(iso).toLocaleString('ru-RU') : '—' }
function isOnline(u: User){
  if (!u.lastLoginAt) return false
  const diff = Date.now() - new Date(u.lastLoginAt).getTime()
  return diff < 2 * 60 * 60 * 1000
}
</script>

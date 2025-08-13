<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/shared/api/client'

type Role = { id:string; name:string; permissions:string[] }

const roles = ref<Role[]>([])
const allPerms = ['product.create','product.update','product.delete','category.manage','order.update','user.manage']

async function load(){
  const { data } = await api.get('/roles')
  roles.value = data || []
}
onMounted(load)

async function toggle(role: Role, perm: string){
  const set = new Set(role.permissions)
  set.has(perm) ? set.delete(perm) : set.add(perm)
  role.permissions = Array.from(set)
  await api.patch('/roles/'+role.id, { permissions: role.permissions })
}
async function addRole(){
  const name = prompt('Название роли')
  if (!name) return
  const { data } = await api.post('/roles', { name, permissions: [] })
  roles.value.push(data)
}
async function removeRole(r: Role){
  if (!confirm('Удалить роль '+r.name+'?')) return
  await api.delete('/roles/'+r.id)
  roles.value = roles.value.filter(x => x.id!==r.id)
}
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Роли и права</h1>
      <button class="btn" @click="addRole">+ Добавить роль</button>
    </div>

    <div class="overflow-auto">
      <table class="min-w-[640px] w-full border rounded-lg">
        <thead class="bg-gray-50">
          <tr>
            <th class="th text-left">Роль</th>
            <th v-for="p in allPerms" :key="p" class="th">{{ p }}</th>
            <th class="th"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in roles" :key="r.id">
            <td class="td text-left font-medium">{{ r.name }}</td>
            <td v-for="p in allPerms" :key="p" class="td">
              <input type="checkbox" :checked="r.permissions.includes(p)" @change="toggle(r,p)" />
            </td>
            <td class="td"><button class="btn" @click="removeRole(r)">Удалить</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.btn{ @apply inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50; }
.th{ @apply px-3 py-2 text-sm border-b; }
.td{ @apply px-3 py-2 text-sm border-b text-center; }
</style>

<template>
  <dialog ref="dlg" class="rounded-xl p-0 w-[1100px] max-w-[96vw]">
    <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
      <div class="font-medium">{{ title }}</div>
      <button class="opacity-70" @click="close">✕</button>
    </div>

    <div class="p-4 grid grid-cols-3 gap-4">
      <div class="col-span-3">
        <nav class="space-x-2">
          <button :class="tabBtn('profile')" @click="tab='profile'">Профиль</button>
          <button :class="tabBtn('perm')" @click="tab='perm'">Права доступа</button>
        </nav>
      </div>

      <template v-if="tab==='profile'">
        <div>
          <label class="block text-sm mb-1">Имя</label>
          <input v-model="model.name" class="border rounded px-3 py-2 w-full" placeholder="Имя пользователя" />
        </div>
        <div>
          <label class="block text-sm mb-1">E-mail</label>
          <input v-model="model.email" type="email" class="border rounded px-3 py-2 w-full" placeholder="user@example.com" />
        </div>
        <div>
          <label class="block text-sm mb-1">Телефон</label>
          <input v-model="model.phone" class="border rounded px-3 py-2 w-full" placeholder="+7 ..." />
        </div>
        <div>
          <label class="block text-sm mb-1">Роль</label>
          <select v-model="model.role" class="border rounded px-3 py-2 w-full" @change="applyRoleIfNeeded">
            <option v-for="r in roleTemplates" :key="r.key" :value="r.key">{{ r.name }}</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Смена роли применит её шаблон прав (если вы не изменяли матрицу вручную).</p>
        </div>
        <div class="flex items-center">
          <label class="inline-flex items-center"><input type="checkbox" v-model="model.isActive" class="mr-2" /> Активен</label>
        </div>
      </template>

      <template v-else>
        <div class="col-span-3 flex items-center justify-between">
          <div class="text-sm">
            Применить шаблон роли:
            <select v-model="roleToApply" class="border rounded px-2 py-1">
              <option disabled value="">— выбрать —</option>
              <option v-for="r in roleTemplates" :key="r.key" :value="r.key">{{ r.name }}</option>
            </select>
            <button class="border rounded px-2 py-1 ml-2" @click="applyRoleTemplate">Применить</button>
          </div>
          <div>
            <button class="text-xs underline" @click="selectAll(true)">Выделить всё (Чтение+Ред.)</button>
            <button class="text-xs underline ml-2" @click="selectAll(false)">Только чтение</button>
          </div>
        </div>

        <table class="col-span-3 w-full text-sm border rounded">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="p-2 text-left">Раздел</th>
              <th class="p-2 text-left w-28">Чтение</th>
              <th class="p-2 text-left w-32">Редактирование</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in model.permissions" :key="p.page" class="border-b">
              <td class="p-2">{{ resName(p.page) }}</td>
              <td class="p-2"><input type="checkbox" v-model="p.read" /></td>
              <td class="p-2"><input type="checkbox" v-model="p.write" /></td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>

    <div class="p-3 border-t flex justify-end gap-2">
      <button class="border rounded px-3 py-2" @click="close">Отмена</button>
      <button class="rounded px-3 py-2 bg-black text-white" @click="submit">Сохранить</button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { listRoleTemplates, listResources, getRoleTemplate } from '@/api/users'

const props = defineProps<{ value: any, title: string }>()
const emit = defineEmits(['submit','close'])

const dlg = ref<HTMLDialogElement|null>(null)
const model = ref<any>({})
const tab = ref<'profile'|'perm'>('profile')
const roleTemplates = listRoleTemplates()
const resources = listResources()
const roleToApply = ref<string>('')

function tabBtn(t: string){ return (tab.value===t ? 'px-3 py-2 rounded bg-black text-white' : 'px-3 py-2 rounded border') }
function resName(k: any){ const f = resources.find(r=>r.key===k); return f?f.name:k }

async function open(){
  await nextTick()
  tab.value = 'profile'
  const base = props.value || {
    name:'', email:'', phone:'', role: 'viewer', isActive: true,
    permissions: resources.map(r => ({ page:r.key, read: r.key!=='users', write: false }))
  }
  model.value = JSON.parse(JSON.stringify(base))
  dlg.value?.showModal()
}
function close(){ dlg.value?.close(); emit('close') }
function submit(){ emit('submit', model.value) }

// --- FIX: apply templates IN-PLACE to keep checkbox bindings in sync ---
function applyRoleIfNeeded(){
  if (tab.value==='profile') {
    const tmpl = getRoleTemplate(model.value.role as any)
    if (tmpl) {
      applyPermissionsInPlace(tmpl.permissions)
    }
  }
}
function applyRoleTemplate(){
  if (!roleToApply.value) return
  const tmpl = getRoleTemplate(roleToApply.value as any)
  if (tmpl) {
    applyPermissionsInPlace(tmpl.permissions)
  }
}
function applyPermissionsInPlace(tmplPerms: any[]){
  const map = new Map(tmplPerms.map(p=>[p.page, p]))
  // mutate existing array items to preserve reactivity of v-model checkboxes
  model.value.permissions.forEach((p:any) => {
    const t = map.get(p.page)
    if (t) { p.read = !!t.read; p.write = !!t.write }
  })
}

function selectAll(write: boolean){
  model.value.permissions.forEach((p:any)=>{ p.read = true; p.write = write })
}

defineExpose({ open, close })
</script>

<style>
dialog::backdrop { background: rgba(0,0,0,.2) }
dialog { border: 1px solid #eee }
</style>

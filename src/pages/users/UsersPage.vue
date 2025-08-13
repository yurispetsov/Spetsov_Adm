<template>
  <section class="p-6 h-[calc(100vh-88px)] flex flex-col">
    <header class="mb-3 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Пользователи и права</h1>
    </header>

    <UsersTable class="flex-1 border rounded overflow-hidden"
      :items="store.items" :q="store.q" :role="store.role" :active="store.active"
      @update:q="store.setQuery($event)" @update:role="store.setRole($event)" @update:active="store.setActive($event)"
      @create="create" @edit="edit" @remove="remove" />

    <UserEditModal ref="refEdit" :value="store.editing" title="Пользователь" @submit="save" @close="store.stopEdit" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUsersStore } from '@/stores/users'
import UsersTable from '@/components/users/UsersTable.vue'
import UserEditModal from '@/components/users/UserEditModal.vue'

const store = useUsersStore()
const refEdit = ref<InstanceType<typeof UserEditModal>|null>(null)

function create(){ store.startEdit(null); refEdit.value?.open() }
function edit(u: any){ store.startEdit(u); refEdit.value?.open() }
function save(data: any){ store.save(data) }
function remove(id: string){ store.remove(id) }

onMounted(()=> store.fetch())
</script>

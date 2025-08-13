<template>
  <section class="p-6 h-[calc(100vh-88px)] flex flex-col">
    <header class="mb-3">
      <h1 class="text-xl font-semibold">Клиенты</h1>
      <nav class="mt-3 border-b">
        <button :class="tab==='legal' ? act : btn" @click="setTab('legal')">Юридические лица</button>
        <button :class="tab==='person' ? act : btn" @click="setTab('person')">Физические лица</button>
      </nav>
    </header>

    <ClientsTable class="flex-1 border rounded overflow-hidden"
      :items="store.items" :type="tab"
      @create="onCreate" @edit="onEdit" @remove="store.remove" @set-filter="setFilter" />

    <ClientEditModal ref="modalRef" :value="store.editing" :title="modalTitle" :defaultTab="tab" @submit="onSubmit" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useClientsStore } from '@/stores/clients'
import type { Client, ClientType } from '@/api/clients'
import ClientsTable from '@/components/clients/ClientsTable.vue'
import ClientEditModal from '@/components/clients/ClientEditModal.vue'

const store = useClientsStore()
const tab = computed(() => store.tab)
const btn = 'inline-block px-4 py-2 border rounded-t bg-white'
const act = 'inline-block px-4 py-2 border border-b-0 rounded-t bg-white font-medium'

function setTab(t: ClientType){ store.setTab(t) }
function setFilter(f: any){ if (f.q!=null) store.setQuery(f.q); if (f.isActive!==undefined) { store.isActive = f.isActive; store.fetch() } }
function onCreate(){ store.startCreate(); modalTitle.value = tab.value==='legal' ? 'Новый юридический клиент' : 'Новый физический клиент'; modalRef.value?.open() }
function onEdit(c: Client){ store.startEdit(c); modalTitle.value = 'Изменить клиента'; modalRef.value?.open() }
async function onSubmit(model: Client){ store.editing = model; await store.save(); }

const modalRef = ref<InstanceType<typeof ClientEditModal> | null>(null)
const modalTitle = ref('')

onMounted(()=> store.fetch())
</script>

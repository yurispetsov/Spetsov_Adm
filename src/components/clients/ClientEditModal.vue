<template>
  <dialog ref="dlg" class="rounded-xl p-0 w-[960px] max-w-[96vw]">
    <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
      <div class="font-medium">{{ title }}</div>
      <button class="opacity-70" @click="close">✕</button>
    </div>

    <!-- Tabs hidden when editing existing record -->
    <div class="border-b px-4 pt-2" v-if="!lockedType">
      <nav class="flex gap-4">
        <button :class="tab==='legal' ? act : btn" @click="to('legal')">Юридические лица</button>
        <button :class="tab==='person' ? act : btn" @click="to('person')">Физические лица</button>
      </nav>
    </div>

    <div class="p-4">
      <LegalForm v-if="tab==='legal'" v-model="modelLegal" />
      <PersonForm v-else v-model="modelPerson" />
    </div>

    <div class="p-3 border-t flex justify-end gap-2">
      <button class="border rounded px-3 py-2" @click="close">Отмена</button>
      <button class="rounded px-3 py-2 bg-black text-white" @click="$emit('submit', current)">Сохранить</button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { Client, ClientType, LegalClient, PersonClient } from '@/api/clients'
import LegalForm from './LegalForm.vue'
import PersonForm from './PersonForm.vue'

const props = defineProps<{ value: Client | null; title: string; defaultTab?: ClientType }>()
const emit = defineEmits(['submit'])

const dlg = ref<HTMLDialogElement|null>(null)
const tab = ref<ClientType>(props.defaultTab || 'legal')
const btn = 'px-3 py-2 rounded-t border bg-white'
const act = 'px-3 py-2 rounded-t border border-b-0 bg-white font-medium'

// When editing, lock the type so tabs are hidden
const lockedType = computed<ClientType | null>(() => (props.value && props.value.type) ? props.value.type as ClientType : null)

const modelLegal = ref<LegalClient>({} as any)
const modelPerson = ref<PersonClient>({} as any)

const current = computed<Client>(() => tab.value === 'legal' ? (modelLegal.value as any) : (modelPerson.value as any))

function to(t: ClientType){
  if (lockedType.value) return // prevent changing type in edit mode
  tab.value = t
  // reset opposite model to avoid stale values when switching during creation
  if (t === 'legal') modelLegal.value = modelLegal.value?.id ? modelLegal.value : ({ id:'', type:'legal', createdAt:'', updatedAt:'', isActive:true, name:'', inn:'' } as any)
  else modelPerson.value = modelPerson.value?.id ? modelPerson.value : ({ id:'', type:'person', createdAt:'', updatedAt:'', isActive:true, lastName:'', firstName:'' } as any)
}

async function open() {
  // wait for parent to update props.value (store.editing) before reading it
  await nextTick()
  const v = props.value

  // choose active tab by type if editing, otherwise default/create
  tab.value = (v?.type as ClientType) || (props.defaultTab || tab.value)

  if (v?.type === 'legal') {
    modelLegal.value = JSON.parse(JSON.stringify(v))
  } else if (v?.type === 'person') {
    modelPerson.value = JSON.parse(JSON.stringify(v))
  } else {
    // creation
    if (tab.value === 'legal') {
      modelLegal.value = { id:'', type:'legal', createdAt:'', updatedAt:'', isActive:true, name:'', inn:'' } as any
      modelPerson.value = {} as any
    } else {
      modelPerson.value = { id:'', type:'person', createdAt:'', updatedAt:'', isActive:true, lastName:'', firstName:'' } as any
      modelLegal.value = {} as any
    }
  }

  dlg.value?.showModal()
}
function close(){ dlg.value?.close() }

defineExpose({ open, close, to })
</script>

<style>
dialog::backdrop { background: rgba(0,0,0,.2) }
dialog { border: 1px solid #eee }
</style>

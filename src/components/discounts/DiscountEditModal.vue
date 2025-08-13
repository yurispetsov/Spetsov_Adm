<template>
  <dialog ref="dlg" class="rounded-xl p-0 w-[960px] max-w-[96vw]">
    <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
      <div class="font-medium">{{ title }}</div>
      <button class="opacity-70" @click="close">✕</button>
    </div>

    <div class="p-4 grid grid-cols-2 gap-4">
      <template v-if="mode==='promo'">
        <div>
          <label class="block text-sm mb-1">Промокод</label>
          <input v-model="model.code" class="border rounded px-3 py-2 w-full" placeholder="WELCOME10" />
        </div>
        <div>
          <label class="block text-sm mb-1">Название</label>
          <input v-model="model.name" class="border rounded px-3 py-2 w-full" placeholder="Описание акции" />
        </div>
      </template>
      <template v-else>
        <div class="col-span-2">
          <label class="block text-sm mb-1">Название скидки</label>
          <input v-model="model.name" class="border rounded px-3 py-2 w-full" placeholder="Минус 10% при самовывозе" />
        </div>
      </template>

      <div>
        <label class="block text-sm mb-1">Тип скидки</label>
        <select v-model="model.kind" class="border rounded px-3 py-2 w-full">
          <option value="percent">Процент (-%)</option>
          <option value="amount">Фикс. сумма (-₽)</option>
          <option value="free_shipping">Бесплатная доставка</option>
        </select>
      </div>
      <div>
        <label class="block text-sm mb-1">Значение</label>
        <input v-model.number="model.value" type="number" class="border rounded px-3 py-2 w-full" :disabled="model.kind==='free_shipping'" placeholder="10" />
      </div>

      <div>
        <label class="block text-sm mb-1">Оплата</label>
        <select v-model="model.payment" class="border rounded px-3 py-2 w-full">
          <option value="all">Любая</option>
          <option value="cash">Наличные</option>
          <option value="card">Карта</option>
          <option value="online">Онлайн-оплата</option>
          <option value="invoice">Счёт (безнал)</option>
        </select>
      </div>
      <div>
        <label class="block text-sm mb-1">Получение</label>
        <select v-model="model.delivery" class="border rounded px-3 py-2 w-full">
          <option value="all">Любой</option>
          <option value="pickup">Самовывоз</option>
          <option value="delivery">Доставка</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">Действует с</label>
        <input v-model="model.validFrom" type="date" class="border rounded px-3 py-2 w-full" />
      </div>
      <div>
        <label class="block text-sm mb-1">по</label>
        <input v-model="model.validTo" type="date" class="border rounded px-3 py-2 w-full" />
      </div>

      <div class="col-span-2">
        <label class="block text-sm mb-1">Группы клиентов (через запятую)</label>
        <input v-model="groups" class="border rounded px-3 py-2 w-full" placeholder="vip, wholesale, b2b" />
      </div>

      <div class="col-span-2">
        <label class="block text-sm mb-1">Клиенты (ID через запятую, временно)</label>
        <input v-model="clients" class="border rounded px-3 py-2 w-full" placeholder="clientId1, clientId2" />
      </div>

      <div class="col-span-2">
        <label class="inline-flex items-center">
          <input type="checkbox" v-model="model.active" class="mr-2" /> Активна
        </label>
      </div>
    </div>

    <div class="p-3 border-t flex justify-end gap-2">
      <button class="border rounded px-3 py-2" @click="close">Отмена</button>
      <button class="rounded px-3 py-2 bg-black text-white" @click="submit">Сохранить</button>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { Discount, PromoCode } from '@/api/discounts'

const props = defineProps<{ value: any, mode: 'promo'|'discount', title: string }>()
const emit = defineEmits(['submit','close'])

const dlg = ref<HTMLDialogElement|null>(null)
const model = ref<any>({})

const groups = computed({
  get(){ return (model.value.groupKeys||[]).join(', ') },
  set(v: string){ model.value.groupKeys = v.split(',').map(s=>s.trim()).filter(Boolean) }
})
const clients = computed({
  get(){ return (model.value.clientIds||[]).join(', ') },
  set(v: string){ model.value.clientIds = v.split(',').map(s=>s.trim()).filter(Boolean) }
})

async function open(){
  await nextTick()
  model.value = JSON.parse(JSON.stringify(props.value || (props.mode==='promo'
    ? { code:'', kind:'percent', value:10, payment:'all', delivery:'all', active:true }
    : { name:'', kind:'percent', value:10, payment:'all', delivery:'all', active:true }
  )))
  dlg.value?.showModal()
}
function close(){ dlg.value?.close(); emit('close') }
function submit(){ emit('submit', model.value) }

defineExpose({ open, close })
</script>

<style>
dialog::backdrop { background: rgba(0,0,0,.2) }
dialog { border: 1px solid #eee }
</style>

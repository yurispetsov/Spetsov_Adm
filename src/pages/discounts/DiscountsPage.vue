<template>
  <section class="p-6 h-[calc(100vh-88px)] flex flex-col">
    <h1 class="text-xl font-semibold mb-4">Скидки, промокоды и типы цен</h1>

    <div class="flex-1 grid grid-cols-[220px,1fr] gap-4">
      <aside class="space-y-2">
        <button :class="navBtn('promos')" @click="store.setTab('promos')" class="block w-full text-left">Промокоды</button>
        <button :class="navBtn('discounts')" @click="store.setTab('discounts')" class="block w-full text-left">Скидки</button>
        <button :class="navBtn('prices')" @click="store.setTab('prices')" class="block w-full text-left">Типы цен</button>

        <div class="mt-4 p-3 border rounded text-xs text-gray-600">
          <div class="font-medium mb-1">Примечания</div>
          <ul class="list-disc pl-4 space-y-1">
            <li>Типы цен импортируются из 1С и обычно взаимоисключающие.</li>
            <li>Поле «приоритет» не требуется — выберем тип по клиенту.</li>
            <li>Наценка/скидка применяются поверх базовой логики при расчёте.</li>
          </ul>
        </div>
      </aside>

      <main class="border rounded overflow-hidden">
        <div v-if="store.tab==='promos'">
          <DiscountsTable kind="promos" :rows="store.promos" :q="store.q"
            @update:q="store.setQuery($event)"
            @create="createPromo" @edit="edit" @remove="remove"/>
        </div>
        <div v-else-if="store.tab==='discounts'">
          <DiscountsTable kind="discounts" :rows="store.discounts" :q="store.q"
            @update:q="store.setQuery($event)"
            @create="createDiscount" @edit="edit" @remove="remove"/>
        </div>
        <div v-else>
          <PricesTable :rows="store.prices" :q="store.q"
            @update:q="store.setQuery($event)"
            @create="createPrice" @edit="editPrice" @remove="removePrice" />
        </div>
      </main>
    </div>

    <!-- Modals -->
    <DiscountEditModal ref="refEditPromo" :mode="'promo'" :value="store.editing" title="Промокод" @submit="save" @close="store.stopEdit"/>
    <DiscountEditModal ref="refEditDiscount" :mode="'discount'" :value="store.editing" title="Скидка" @submit="save" @close="store.stopEdit"/>
    <PriceTypeEditModal ref="refEditPrice" :value="priceEditing" title="Тип цены" @submit="savePrice" @close="closePrice"/>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDiscountsStore } from '@/stores/discounts'
import DiscountsTable from '@/components/discounts/DiscountsTable.vue'
import DiscountEditModal from '@/components/discounts/DiscountEditModal.vue'
import PricesTable from '@/components/discounts/PricesTable.vue'
import PriceTypeEditModal from '@/components/discounts/PriceTypeEditModal.vue'

const store = useDiscountsStore()
const refEditPromo = ref<InstanceType<typeof DiscountEditModal>|null>(null)
const refEditDiscount = ref<InstanceType<typeof DiscountEditModal>|null>(null)
const refEditPrice = ref<InstanceType<typeof PriceTypeEditModal>|null>(null)

const priceEditing = ref<any>(null)

function navBtn(t: string){ return (store.tab===t ? 'px-3 py-2 rounded bg-black text-white' : 'px-3 py-2 rounded border') }

function createPromo(){ store.startEdit(null); refEditPromo.value?.open() }
function createDiscount(){ store.startEdit(null); refEditDiscount.value?.open() }
function createPrice(){ priceEditing.value = null; refEditPrice.value?.open() }

function edit(x: any){ store.startEdit(x); (store.tab==='promos' ? refEditPromo : refEditDiscount).value?.open() }
function remove(id: string){ store.remove(id) }
function save(data: any){ store.save(data) }

function editPrice(x: any){ priceEditing.value = x; refEditPrice.value?.open() }
function removePrice(id: string){ store.remove(id) }
function savePrice(data: any){ store.save(data) }
function closePrice(){ /* noop */ }

onMounted(()=> store.fetchAll())
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <div class="col-span-2">
      <label class="block text-sm mb-1">Полное наименование</label>
      <input v-model="model.name" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Краткое наименование</label>
      <input v-model="model.shortName" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">ИНН</label>
      <input v-model="model.inn" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">КПП</label>
      <input v-model="model.kpp" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">ОГРН</label>
      <input v-model="model.ogrn" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">ОКПО</label>
      <input v-model="model.okpo" class="w-full border rounded px-3 py-2" />
    </div>
    <div class="col-span-2">
      <label class="block text-sm mb-1">Юр. адрес</label>
      <input v-model="model.addressLegal" class="w-full border rounded px-3 py-2" />
    </div>
    <div class="col-span-2">
      <label class="block text-sm mb-1">Фактический адрес</label>
      <input v-model="model.addressActual" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Банк</label>
      <input v-model="model.bankName" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">БИК</label>
      <input v-model="model.bankBik" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Р/с</label>
      <input v-model="model.bankAccount" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">К/с</label>
      <input v-model="model.bankCorr" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Руководитель</label>
      <input v-model="model.chiefName" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Должность</label>
      <input v-model="model.chiefPost" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">E-mail(ы)</label>
      <input v-model="emails" placeholder="через запятую" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Телефон(ы)</label>
      <input v-model="phones" placeholder="через запятую" class="w-full border rounded px-3 py-2" />
    </div>
    <div class="col-span-2">
      <label class="block text-sm mb-1">Примечания</label>
      <textarea v-model="model.notes" class="w-full border rounded px-3 py-2"></textarea>
    </div>
    <div class="col-span-2">
      <label><input type="checkbox" v-model="model.isActive" /> Активен</label>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { LegalClient } from '@/api/clients'
const model = defineModel<LegalClient>({ required: true })
const emails = computed({
  get: () => (model.value.emails||[]).join(', '),
  set: (v: string) => model.value.emails = v.split(',').map(s => s.trim()).filter(Boolean)
})
const phones = computed({
  get: () => (model.value.phones||[]).join(', '),
  set: (v: string) => model.value.phones = v.split(',').map(s => s.trim()).filter(Boolean)
})
</script>

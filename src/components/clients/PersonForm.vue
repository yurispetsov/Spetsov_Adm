<template>
  <div class="grid grid-cols-2 gap-3">
    <div>
      <label class="block text-sm mb-1">Фамилия</label>
      <input v-model="model.lastName" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Имя</label>
      <input v-model="model.firstName" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Отчество</label>
      <input v-model="model.middleName" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Дата рождения</label>
      <input v-model="model.birthDate" type="date" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">E-mail</label>
      <input v-model="model.email" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Телефон</label>
      <input v-model="model.phone" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Паспорт: серия</label>
      <input v-model="model.passportSeries" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Паспорт: номер</label>
      <input v-model="model.passportNumber" class="w-full border rounded px-3 py-2" />
    </div>
    <div class="col-span-2">
      <label class="block text-sm mb-1">Кем выдан</label>
      <input v-model="model.passportIssued" class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm mb-1">Дата выдачи</label>
      <input v-model="model.passportDate" type="date" class="w-full border rounded px-3 py-2" />
    </div>
    <div class="col-span-2">
      <label class="block text-sm mb-1">Адрес</label>
      <input v-model="model.address" class="w-full border rounded px-3 py-2" />
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
import type { PersonClient } from '@/api/clients'
const model = defineModel<PersonClient>({ required: true })
</script>

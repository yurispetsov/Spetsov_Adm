
<template>
  <div v-if="node" class="p-4 space-y-4">
    <div class="text-xl font-medium">{{node.name}}</div>
    <div class="grid grid-cols-2 gap-3 max-w-xl">
      <label class="text-sm">Slug
        <input class="input" v-model="draft.slug" />
      </label>
      <label class="text-sm">Видимость
        <select class="input" v-model="draft.isVisible"><option :value="true">Показывать</option><option :value="false">Скрыть</option></select>
      </label>
      <label class="text-sm col-span-2">Meta title
        <input class="input" v-model="draft.metaTitle" placeholder="—" />
      </label>
      <label class="text-sm col-span-2">H1
        <input class="input" v-model="draft.h1" placeholder="—" />
      </label>
      <label class="text-sm col-span-2">Meta description
        <textarea class="input h-24" v-model="draft.metaDescription" placeholder="—" />
      </label>
    </div>
    <div class="flex gap-2">
      <button class="btn btn-primary" @click="$emit('save', draft)">Сохранить</button>
      <button class="btn" @click="$emit('reset')">Сброс</button>
    </div>
  </div>
  <div v-else class="p-4 text-gray-500">Выберите категорию слева…</div>
</template>
<script setup lang="ts">
import { reactive, watch } from "vue";
const props = defineProps<{ node: any | null }>()
const draft = reactive<any>({})
watch(()=>props.node, (n)=>{
  Object.assign(draft, n ? {...n} : {})
},{ immediate: true })
</script>

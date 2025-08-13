<template>
  <section class="p-6 h-[calc(100vh-88px)] flex gap-6">
    <aside class="w-80 border rounded p-3 overflow-auto">
      <header class="mb-2 flex items-center justify-between">
        <h2 class="font-semibold">Категории</h2>
        <button class="text-sm underline" @click="createRoot">+ Корневая</button>
      </header>
      <CategoryTree
        :tree="store.tree"
        @select="store.select"
        @create-child="createChild"
        @edit="edit"
        @remove="remove"
      />
    </aside>

    <main class="flex-1 border rounded p-4">
      <div v-if="!store.selected" class="opacity-60">Выберите категорию слева или создайте новую.</div>
      <div v-else class="max-w-xl space-y-3">
        <div class="text-lg font-semibold">{{ store.selected?.name }}</div>
        <label class="text-sm block">Название
          <input v-model="model.name" class="border rounded px-3 py-2 w-full" />
        </label>
        <label class="text-sm block">Slug
          <input v-model="model.slug" class="border rounded px-3 py-2 w-full" />
        </label>
        <label class="inline-flex items-center gap-2">
          <input type="checkbox" v-model="model.visible" />
          Показывать на сайте
        </label>
        <div class="pt-2 flex gap-2">
          <button class="px-3 py-2 border rounded" @click="reset">Сброс</button>
          <button class="px-3 py-2 bg-black text-white rounded" @click="save">Сохранить</button>
        </div>
      </div>
    </main>

    <CategoryEditModal ref="refModal" @submit="persistNew" />
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue';
import { useCategoriesStore } from '@/stores/categories';
import CategoryTree from '@/components/categories/CategoryTree.vue';
import CategoryEditModal from '@/components/categories/CategoryEditModal.vue';

const store = useCategoriesStore();
const model = reactive({ name: '', slug: '', visible: true });
const refModal = ref<InstanceType<typeof CategoryEditModal> | null>(null);

onMounted(()=> store.fetch());

watch(() => store.selected, (c) => {
  if (c) Object.assign(model, { name: c.name, slug: c.slug, visible: c.visible });
}, { immediate: true });

function reset(){
  const c = store.selected;
  if (!c) return;
  Object.assign(model, { name: c.name, slug: c.slug, visible: c.visible });
}
async function save(){
  const c = store.selected;
  if (!c) return;
  await store.update(c.id, model);
}
function createRoot(){
  refModal.value?.open({ parentId: null, visible: true });
}
function createChild(parentId: string){
  refModal.value?.open({ parentId, visible: true });
}
function edit(id: string){
  const c = store.items.find(x=>x.id===id);
  if (!c) return;
  refModal.value?.open(c);
}
async function remove(id: string){
  if (!confirm('Удалить категорию?')) return;
  await store.remove(id);
}
async function persistNew(payload: any){
  await store.create({ ...payload });
}
</script>

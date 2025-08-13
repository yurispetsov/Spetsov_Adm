import { api } from '@/shared/api/client';
import type { CategoryDTO } from '@/shared/types/catalog';

export async function fetchCatalog() {
  const { data } = await api.get<CategoryDTO[]>('/catalog');
  return data;
}

export async function createCategory(payload: Partial<CategoryDTO>) {
  const { data } = await api.post<CategoryDTO>('/catalog', payload);
  return data;
}

export async function updateCategory(id: string, patch: Partial<CategoryDTO>) {
  const { data } = await api.patch<CategoryDTO>(`/catalog/${id}`, patch);
  return data;
}

export async function deleteCategory(id: string) {
  await api.delete(`/catalog/${id}`);
}

export async function bulkUpdate(items: CategoryDTO[]) {
  await Promise.all(items.map(i => api.patch(`/catalog/${i.id}`, i)));
}

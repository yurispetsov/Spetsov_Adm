// src/stores/clients.ts
import { defineStore } from 'pinia'
import type { Client, ClientType, ListQuery } from '@/api/clients'
import { listClients, createClient, updateClient, deleteClient } from '@/api/clients'

export const useClientsStore = defineStore('clients', {
  state: () => ({
    tab: 'legal' as ClientType,
    items: [] as Client[],
    total: 0,
    page: 1,
    pageSize: 20,
    q: '',
    isActive: null as boolean | null,
    loading: false,
    editing: null as Client | null,
  }),
  actions: {
    setTab(t: ClientType){ this.tab = t; this.page = 1; this.fetch() },
    setQuery(q: string){ this.q = q; this.page = 1; this.fetch() },
    setPage(p: number){ this.page = p; this.fetch() },
    async fetch(){
      this.loading = true
      try {
        const res = await listClients({ type:this.tab, q:this.q, page:this.page, pageSize:this.pageSize, isActive:this.isActive } as ListQuery)
        this.items = res.items; this.total = res.total
      } finally { this.loading = false }
    },
    startCreate(){ this.editing = { id:'', type:this.tab, createdAt:'', updatedAt:'', isActive:true } as any },
    startEdit(c: Client){ this.editing = JSON.parse(JSON.stringify(c)) },
    async save(){
      if (!this.editing) return
      if (!this.editing.id) {
        const created = await createClient({ ...this.editing, type:this.tab } as any)
        this.editing = null; await this.fetch(); return created
      } else {
        await updateClient(this.editing.id, this.editing as any); this.editing = null; await this.fetch()
      }
    },
    async remove(id: string){ await deleteClient(id); await this.fetch() }
  }
})

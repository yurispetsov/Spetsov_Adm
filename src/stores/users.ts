// src/stores/users.ts (patched)
import { defineStore } from 'pinia'
import type { User, RoleKey } from '@/api/users'
import { listUsers, saveUser, deleteUser, listRoleTemplates, listResources, toggleUserActive } from '@/api/users'

export const useUsersStore = defineStore('users', {
  state: () => ({
    q: '',
    role: 'all' as RoleKey | 'all',
    active: 'all' as 'all'|'active'|'inactive',
    sort: 'name' as 'name'|'last'|'status',
    items: [] as User[],
    editing: null as any,
    resources: listResources(),
    roleTemplates: listRoleTemplates(),
  }),
  actions: {
    fetch(){ 
      let arr = listUsers({ q:this.q, role:this.role, active:this.active })
      if (this.sort==='last') {
        arr.sort((a,b)=> (new Date(b.lastLoginAt||0).getTime()) - (new Date(a.lastLoginAt||0).getTime()))
      } else if (this.sort==='status') {
        const s = (u:User)=> u.isActive ? 1 : 0
        arr.sort((a,b)=> s(b)-s(a))
      } else {
        arr.sort((a,b)=> (a.name||'').localeCompare(b.name||''))
      }
      this.items = arr
    },
    setQuery(v: string){ this.q = v; this.fetch() },
    setRole(v: any){ this.role = v; this.fetch() },
    setActive(v: any){ this.active = v; this.fetch() },
    setSort(v: any){ this.sort = v; this.fetch() },
    startEdit(u: any){ this.editing = JSON.parse(JSON.stringify(u || null)) },
    stopEdit(){ this.editing = null },
    async save(data: any){ await saveUser(data); this.fetch(); this.stopEdit() },
    async remove(id: string){ await deleteUser(id); this.fetch() },
    async toggle(id: string, flag: boolean){ await toggleUserActive(id, flag); this.fetch() },
  }
})

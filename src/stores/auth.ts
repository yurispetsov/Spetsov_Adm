// src/stores/auth.ts
import { defineStore } from 'pinia'
import type { User, ResourceKey, Action } from '@/api/users'
import { listUsers, can as canApi } from '@/api/users'

const KEY = '__current_user_id__'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    current: null as User | null,
  }),
  getters: {
    isAuthed: (s) => !!s.current,
    can: (s) => (page: ResourceKey, action: Action) => s.current ? canApi(s.current, page, action) : false,
  },
  actions: {
    load() {
      const id = localStorage.getItem(KEY)
      const users = listUsers()
      let u = users[0] || null
      if (id) {
        const hit = users.find(x => x.id === id)
        if (hit) u = hit
      }
      this.current = u
      if (u) localStorage.setItem(KEY, u.id)
    },
    loginAs(id: string) {
      const u = listUsers().find(x => x.id === id) || null
      this.current = u
      if (u) localStorage.setItem(KEY, u.id)
    },
    logout(){
      this.current = null
      localStorage.removeItem(KEY)
    }
  }
})

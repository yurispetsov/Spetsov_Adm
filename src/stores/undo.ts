// src/stores/undo.ts
import { defineStore } from 'pinia'
import { UndoStack, type UndoAction } from '@/utils/undo'

export const useUndoStore = defineStore('undo', {
  state: () => ({
    stack: new UndoStack(),
    toast: null as null | { message: string, ts: number }
  }),
  actions: {
    push(a: UndoAction) {
      this.stack.push(a)
      this.toast = { message: a.label + ' — можно отменить (Ctrl+Z)', ts: Date.now() }
      setTimeout(()=>{ if (this.toast && Date.now() - this.toast.ts > 3000) this.toast = null }, 3200)
    },
    async undo() { await this.stack.undo() },
    async redo() { await this.stack.redo() }
  }
})

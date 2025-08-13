import { defineStore } from 'pinia'

let id = 1
export type Toast = { id: number; type: 'success'|'error'|'info'; message: string; timeout?: number }

export const useNotifyStore = defineStore('notify', {
  state: () => ({ toasts: [] as Toast[] }),
  actions: {
    push(t: Omit<Toast, 'id'>) {
      const toast = { id: id++, timeout: 4000, ...t }
      this.toasts.push(toast)
      setTimeout(() => { this.remove(toast.id) }, toast.timeout)
    },
    success(message: string) { this.push({ type: 'success', message }) },
    error(message: string) { this.push({ type: 'error', message }) },
    info(message: string) { this.push({ type: 'info', message }) },
    remove(id: number) { this.toasts = this.toasts.filter(t => t.id !== id) }
  }
})

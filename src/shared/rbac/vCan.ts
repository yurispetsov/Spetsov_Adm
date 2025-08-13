import type { DirectiveBinding } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { hasPerm } from './index'

export const vCan = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const auth = useAuthStore()
    const allowed = hasPerm(auth.user?.permissions, binding.value)
    if (!allowed) el.style.display = 'none'
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const auth = useAuthStore()
    const allowed = hasPerm(auth.user?.permissions, binding.value)
    if (!allowed) el.style.display = 'none'
    else el.style.display = ''
  }
}

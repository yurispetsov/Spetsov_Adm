import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function authGuard(to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) {
  const auth = useAuthStore()
  if (to.meta?.public) return next()
  if (!auth.isAuthenticated) return next({ name: 'login', query: { redirect: to.fullPath } })
  return next()
}

// src/acl/acl.ts
import type { User, ResourceKey, Action } from '@/api/users'
import { can } from '@/api/users'

// Simple helper (future place for global current user state / guards)
export function canUser(user: User | null | undefined, page: ResourceKey, action: Action): boolean {
  if (!user) return false
  return can(user, page, action)
}

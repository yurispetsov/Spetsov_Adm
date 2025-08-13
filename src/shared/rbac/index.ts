export type Permission = string
export type Role = { name: string; permissions: Permission[] }

export function hasPerm(perms: Permission[] | undefined, needed: Permission | Permission[]): boolean {
  if (!perms) return false
  const arr = Array.isArray(needed) ? needed : [needed]
  return arr.every(p => perms.includes(p))
}

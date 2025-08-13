// src/api/users.ts
export type ID = string
export type Action = 'read'|'write'
export type ResourceKey = 'dashboard'|'products'|'categories'|'clients'|'orders'|'discounts'|'users'|'settings'
export type RoleKey = 'admin'|'manager'|'sales'|'warehouse'|'viewer'

export interface Permission {
  page: ResourceKey
  read: boolean
  write: boolean
}
export interface User {
  id: ID
  email: string
  name: string
  phone?: string
  role: RoleKey
  isActive: boolean
  permissions: Permission[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface RoleTemplate {
  key: RoleKey
  name: string
  description?: string
  permissions: Permission[]
}

const RESOURCES: { key: ResourceKey, name: string }[] = [
  { key:'dashboard',  name:'Дашборд' },
  { key:'products',   name:'Товары' },
  { key:'categories', name:'Категории' },
  { key:'clients',    name:'Клиенты' },
  { key:'orders',     name:'Заказы' },
  { key:'discounts',  name:'Скидки/Цены' },
  { key:'users',      name:'Пользователи/Роли' },
  { key:'settings',   name:'Настройки' },
]

function fullAccess(): Permission[] { return RESOURCES.map(r => ({ page:r.key, read:true, write:true })) }
function roAccess(): Permission[]   { return RESOURCES.map(r => ({ page:r.key, read:true, write:false })) }

const ROLE_TEMPLATES: RoleTemplate[] = [
  { key:'admin', name:'Администратор', description:'Полный доступ', permissions: fullAccess() },
  { key:'manager', name:'Менеджер', description:'Работа с товарами/заказами/клиентами/скидками', permissions: [
      { page:'dashboard', read:true, write:false },
      { page:'products', read:true, write:true },
      { page:'categories', read:true, write:true },
      { page:'clients', read:true, write:true },
      { page:'orders', read:true, write:true },
      { page:'discounts', read:true, write:true },
      { page:'users', read:true, write:false },
      { page:'settings', read:true, write:false },
  ]},
  { key:'sales', name:'Отдел продаж', description:'Заказы/клиенты/акции', permissions: [
      { page:'dashboard', read:true, write:false },
      { page:'products', read:true, write:false },
      { page:'categories', read:true, write:false },
      { page:'clients', read:true, write:true },
      { page:'orders', read:true, write:true },
      { page:'discounts', read:true, write:true },
      { page:'users', read:false, write:false },
      { page:'settings', read:true, write:false },
  ]},
  { key:'warehouse', name:'Склад', description:'Сборка заказов', permissions: [
      { page:'dashboard', read:true, write:false },
      { page:'products', read:true, write:false },
      { page:'categories', read:true, write:false },
      { page:'clients', read:false, write:false },
      { page:'orders', read:true, write:true },
      { page:'discounts', read:false, write:false },
      { page:'users', read:false, write:false },
      { page:'settings', read:false, write:false },
  ]},
  { key:'viewer', name:'Только просмотр', description:'Без права записи', permissions: roAccess() },
]

const KEY = '__mock_admin_users_v1__'

function makeId(): ID {
  try { return (globalThis as any).crypto?.randomUUID?.() as string } catch {}
  return 'u' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36).slice(-6)
}
const now = () => new Date().toISOString()

export function listResources(){ return RESOURCES }
export function listRoleTemplates(){ return ROLE_TEMPLATES.map(({permissions, ...rest})=>rest) }
export function getRoleTemplate(key: RoleKey): RoleTemplate | null { return ROLE_TEMPLATES.find(r => r.key === key) || null }

function seed(): User[] {
  const admin: User = {
    id: makeId(), email: 'admin@example.com', name:'Admin', role:'admin', isActive: true,
    permissions: fullAccess(), createdAt: now(), updatedAt: now(), lastLoginAt: now(),
  }
  const manager: User = {
    id: makeId(), email: 'manager@example.com', name:'Manager', role:'manager', isActive: true,
    permissions: getRoleTemplate('manager')!.permissions, createdAt: now(), updatedAt: now(), lastLoginAt: now(),
  }
  return [admin, manager]
}

function load(): User[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) { const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s }
  try { return JSON.parse(raw) as User[] } catch { const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s }
}
function save(arr: User[]){ localStorage.setItem(KEY, JSON.stringify(arr)) }

export interface Query {
  q?: string
  role?: RoleKey | 'all'
  active?: 'all' | 'active' | 'inactive'
}
export function listUsers(query: Query = {}): User[] {
  const all = load()
  let arr = all.slice()
  const v = (query.q||'').toLowerCase()
  if (v) arr = arr.filter(u => (u.email+' '+u.name).toLowerCase().includes(v))
  if (query.role && query.role!=='all') arr = arr.filter(u => u.role===query.role)
  if (query.active && query.active!=='all') arr = arr.filter(u => u.isActive === (query.active==='active'))
  arr.sort((a,b)=> a.name.localeCompare(b.name))
  return arr
}

export function saveUser(input: Partial<User>): User {
  const all = load()
  if (!input.id) {
    const tmpl = getRoleTemplate((input.role || 'viewer') as RoleKey)
    const user: User = {
      id: makeId(),
      email: input.email || '',
      name: input.name || '',
      phone: input.phone || '',
      role: (input.role || 'viewer') as RoleKey,
      isActive: input.isActive ?? true,
      permissions: input.permissions || tmpl?.permissions || roAccess(),
      createdAt: now(), updatedAt: now(),
    }
    all.push(user); save(all); return user
  } else {
    const i = all.findIndex(x => x.id === input.id); if (i<0) throw new Error('Not found')
    const next = { ...all[i], ...input, updatedAt: now() } as User
    // if role changed and permissions not manually provided — reset to template
    if (input.role && !input.permissions) {
      const tmpl = getRoleTemplate(input.role as RoleKey)
      if (tmpl) next.permissions = tmpl.permissions.map(p=>({...p}))
    }
    all[i] = next; save(all); return next
  }
}
export function deleteUser(id: ID){ save(load().filter(u=>u.id!==id)) }
export function toggleUserActive(id: ID, flag: boolean){ const all = load(); const i=all.findIndex(u=>u.id===id); if(i>=0){ all[i].isActive=flag; all[i].updatedAt=now(); save(all) } }

// ACL helper: check if user has action for page
export function can(user: User, page: ResourceKey, action: Action): boolean {
  const p = user.permissions.find(x => x.page===page)
  if (!p) return false
  return action==='read' ? p.read : p.write
}

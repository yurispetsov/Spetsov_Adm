// src/api/clients.ts
// Моки клиентов в localStorage. Разделены по типу: 'legal' и 'person'.
export type ID = string
export type ClientType = 'legal' | 'person'

export interface BaseClient {
  id: ID
  type: ClientType
  createdAt: string
  updatedAt: string
  isActive: boolean
  notes?: string
}

export interface LegalClient extends BaseClient {
  type: 'legal'
  name: string            // Полное наименование
  shortName?: string
  inn: string
  kpp?: string
  ogrn?: string
  okpo?: string
  addressLegal?: string   // Юр. адрес
  addressActual?: string  // Фактический адрес
  bankName?: string
  bankBik?: string
  bankAccount?: string    // Р/с
  bankCorr?: string       // К/с
  chiefName?: string      // Руководитель
  chiefPost?: string
  emails?: string[]
  phones?: string[]
}

export interface PersonClient extends BaseClient {
  type: 'person'
  lastName: string
  firstName: string
  middleName?: string
  birthDate?: string
  email?: string
  phone?: string
  passportSeries?: string
  passportNumber?: string
  passportIssued?: string
  passportDate?: string
  address?: string
}

export type Client = LegalClient | PersonClient

const KEY = '__mock_clients_v1__'

function makeId(): ID {
  try { return (globalThis as any).crypto?.randomUUID?.(); } catch {}
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36).slice(-6);
}


function load(): Client[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed()
    return JSON.parse(raw) as Client[]
  } catch { return seed() }
}
function save(items: Client[]) { localStorage.setItem(KEY, JSON.stringify(items)) }

function seed(): Client[] {
  const now = new Date().toISOString()
  const items: Client[] = [
    { id: makeId(), type:'legal', createdAt:now, updatedAt:now, isActive:true, name:'ООО "Пример"', shortName:'ООО Пример', inn:'7701234567', kpp:'770101001', ogrn:'1234567890123', addressLegal:'Москва, ул. Пример, 1', bankName:'ПАО Сбербанк', bankBik:'044525225', bankAccount:'40702810000000000001', bankCorr:'30101810400000000225', chiefName:'Иванов И.И.', chiefPost:'Генеральный директор', emails:['info@example.com'], phones:['+7 (495) 000-00-00'] },
    { id: makeId(), type:'person', createdAt:now, updatedAt:now, isActive:true, lastName:'Петров', firstName:'Сергей', phone:'+7 999 111-22-33', email:'serg@example.com', address:'СПб, Невский, 10' },
  ]
  save(items)
  return items
}

export interface ListQuery {
  type: ClientType
  q?: string
  page?: number
  pageSize?: number
  isActive?: boolean | null
}

export interface ListResponse {
  items: Client[]
  total: number
  page: number
  pageSize: number
}

export async function listClients(q: ListQuery): Promise<ListResponse> {
  const page = q.page || 1, pageSize = q.pageSize || 20
  const all = load().filter(c => c.type === q.type)
  const filtered = (q.q ? all.filter(c => match(c, q.q!)) : all)
    .filter(c => q.isActive==null ? true : c.isActive === q.isActive)
  const total = filtered.length
  const start = (page-1)*pageSize
  const items = filtered.slice(start, start+pageSize)
  return { items, total, page, pageSize }
}

function match(c: Client, s: string): boolean {
  const v = s.trim().toLowerCase()
  if (!v) return true
  if (c.type==='legal') {
    const x = c as LegalClient
    return [x.name,x.shortName,x.inn,x.kpp,x.ogrn,x.addressLegal,x.addressActual, ...(x.emails||[]), ...(x.phones||[])]
      .filter(Boolean).some(t => String(t).toLowerCase().includes(v))
  } else {
    const x = c as PersonClient
    return [x.lastName,x.firstName,x.middleName,x.email,x.phone,x.address].filter(Boolean)
      .some(t => String(t).toLowerCase().includes(v))
  }
}

export async function getClient(id: ID): Promise<Client | null> {
  return load().find(c => c.id === id) || null
}

export async function createClient(input: Partial<Client> & { type: ClientType }): Promise<Client> {
  const now = new Date().toISOString()
  const id = makeId()
  const base: BaseClient = { id, type: input.type, createdAt: now, updatedAt: now, isActive: true }
  let item: Client
  if (input.type==='legal') {
    item = { ...base, type:'legal', name:'', inn:'', ...(input as any) }
  } else {
    item = { ...base, type:'person', lastName:'', firstName:'', ...(input as any) }
  }
  const all = load(); all.unshift(item); save(all)
  return item
}

export async function updateClient(id: ID, patch: Partial<Client>): Promise<Client> {
  const all = load()
  const i = all.findIndex(c => c.id === id)
  if (i === -1) throw new Error('Not found')
  const next = { ...all[i], ...patch, updatedAt: new Date().toISOString() } as Client
  all[i] = next; save(all); return next
}

export async function deleteClient(id: ID): Promise<void> {
  const next = load().filter(c => c.id !== id)
  save(next)
}

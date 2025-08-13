/* src/api/orders.ts */
import { api } from '@/shared/api/client'

export type OrderStatus = 'new' | 'paid' | 'packed' | 'shipped' | 'done' | 'canceled'
export type DeliveryType = 'pickup' | 'courier'

export interface OrderItem {
  productId: string
  qty: number
  price: number
}

export interface Order {
  id: string
  number: string
  customerId: string
  customerName?: string
  total: number
  status: OrderStatus
  deliveryType: DeliveryType
  pickupStoreId?: string | null
  createdAt: string
  deliveryAt?: string | null
  items: OrderItem[]
}

export interface OrdersResponse {
  items: Order[]
  total: number
  page: number
  perPage: number
}

export async function listOrders(params: {
  q?: string
  status?: string
  page?: number
  perPage?: number
  sort?: 'created' | 'total' | 'status'
} = {}) {
  const { data } = await api.get<OrdersResponse>('/orders', { params })
  return data
}

export async function getOrder(id: string) {
  const { data } = await api.get<Order>(`/orders/${id}`)
  return data
}

export async function updateOrder(id: string, patch: Partial<Order>) {
  const { data } = await api.patch<Order>(`/orders/${id}`, patch)
  return data
}

export type DeliveryKind = 'pickup' | 'courier';

export type OrderStatus =
  | 'new' | 'processing' | 'picking' | 'ready'
  | 'shipped' | 'done' | 'canceled';

export interface OrderItem {
  id: string;
  sku: string;
  article?: string;
  name: string;
  qty: number;
  price: number; // за единицу
}

export interface OrderBrief {
  id: string;
  oneCNumber: string;        // номер в 1С
  customerName: string;      // ФИО или Наименование
  total: number;
  delivery: DeliveryKind;
  pickupStoreId?: string;    // если pickup — откуда
  shipAt?: string;           // дата/время отгрузки ISO
  status: OrderStatus;
  updatedAt?: string;
}

export interface Order extends OrderBrief {
  comment?: string;
  code?: string;             // код для получения
  address?: string;          // для доставки
  items: OrderItem[];
  docs?: Array<{ id: string; title: string; url: string }>;
}

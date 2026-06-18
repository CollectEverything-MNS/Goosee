// Statuts alignés sur order-service (database-per-service, source de vérité).
export type OrderStatus = 'pending' | 'paid' | 'prepared' | 'shipped' | 'cancelled';

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Order {
  id: string;
  reference: string;
  customer: OrderCustomer;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  notes?: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'prepared',
  'shipped',
  'cancelled',
];

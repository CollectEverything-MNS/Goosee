import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Order, OrderStatus } from '../data/order.types';

// Commande telle que renvoyée par order-service (montants en centimes, statuts back).
interface BackendOrder {
  id: string;
  customerId?: string | null;
  customerEmail: string;
  items: { productId: string; name: string; unitPriceCents: number; quantity: number }[];
  totalCents: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt: string;
}

interface ListOrdersResponse {
  message: string;
  orders: BackendOrder[];
}

// Correspondance statut back -> vocabulaire de l'admin (le back ne connaît pas « ready »).
const STATUS_MAP: Record<BackendOrder['status'], OrderStatus> = {
  pending: 'pending',
  paid: 'preparing',
  shipped: 'delivered',
  cancelled: 'cancelled',
};

function toAdminOrder(order: BackendOrder): Order {
  return {
    id: order.id,
    // Pas de référence côté back : on en dérive une lisible depuis l'UUID.
    reference: `CMD-${order.id.slice(0, 8).toUpperCase()}`,
    customer: {
      firstName: order.customerEmail.split('@')[0],
      lastName: '',
      email: order.customerEmail,
    },
    status: STATUS_MAP[order.status],
    items: order.items.map((item) => ({
      id: item.productId,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPriceCents / 100,
    })),
    total: order.totalCents / 100,
    createdAt: order.createdAt,
  };
}

export function useListOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async (): Promise<Order[]> => {
      const res = await api.get<ListOrdersResponse>('/orders');
      const orders = Array.isArray(res) ? res : (res?.orders ?? []);
      return orders.map(toAdminOrder);
    },
  });
}

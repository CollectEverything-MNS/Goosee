import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Order, OrderStatus } from '@/features/orders/data/order.types';

interface BackendOrder {
  id: string;
  customerEmail: string;
  items: { productId: string; name: string; unitPriceCents: number; quantity: number }[];
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
}

interface ListOrdersResponse {
  message: string;
  orders: BackendOrder[];
}

function toOrder(o: BackendOrder): Order {
  return {
    id: o.id,
    reference: `CMD-${o.id.slice(0, 8).toUpperCase()}`,
    customer: { firstName: '', lastName: '', email: o.customerEmail },
    status: o.status,
    items: o.items.map((i) => ({
      id: i.productId,
      productName: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPriceCents / 100,
    })),
    total: o.totalCents / 100,
    createdAt: o.createdAt,
  };
}

// Commandes du client connecté, filtrées par son customerId (order-service via gateway).
export function useMyOrders(customerId?: string) {
  return useQuery({
    queryKey: ['my-orders', customerId],
    queryFn: async (): Promise<Order[]> => {
      const res = await api.get<ListOrdersResponse>(
        `/orders?customerId=${encodeURIComponent(customerId!)}`
      );
      const orders = Array.isArray(res) ? res : (res?.orders ?? []);
      return orders.map(toOrder);
    },
    enabled: !!customerId,
  });
}

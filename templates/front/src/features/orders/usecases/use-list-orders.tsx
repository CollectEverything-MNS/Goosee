import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Order, OrderStatus } from '../data/order.types';

// Commande telle que renvoyée par order-service (montants en centimes). Les statuts
// sont désormais identiques côté admin et back (pas de correspondance à maintenir).
interface BackendOrder {
  id: string;
  customerId?: string | null;
  customerEmail: string;
  // Renseignée au checkout : on s'en sert pour afficher le vrai nom du client.
  billingAddress?: { fullName?: string } | null;
  items: { productId: string; name: string; unitPriceCents: number; quantity: number }[];
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
}

interface ListOrdersResponse {
  message: string;
  orders: BackendOrder[];
}

function toAdminOrder(order: BackendOrder): Order {
  // Nom réel saisi au checkout (billingAddress.fullName) ; à défaut, préfixe de l'email.
  const fullName = order.billingAddress?.fullName?.trim() || order.customerEmail.split('@')[0];
  const [firstName, ...rest] = fullName.split(/\s+/);

  return {
    id: order.id,
    // Pas de référence côté back : on en dérive une lisible depuis l'UUID.
    reference: `CMD-${order.id.slice(0, 8).toUpperCase()}`,
    customer: {
      firstName,
      lastName: rest.join(' '),
      email: order.customerEmail,
    },
    status: order.status,
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

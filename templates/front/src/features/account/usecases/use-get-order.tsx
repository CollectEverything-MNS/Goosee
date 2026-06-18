import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { OrderStatus } from '@/features/orders/data/order.types';

export interface InvoiceBillingAddress {
  fullName: string;
  line1: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export interface InvoiceOrder {
  id: string;
  reference: string;
  customerEmail: string;
  billingAddress?: InvoiceBillingAddress;
  items: InvoiceItem[];
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
}

interface BackendOrder {
  id: string;
  customerEmail: string;
  billingAddress?: InvoiceBillingAddress | null;
  items: InvoiceItem[];
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
}

interface GetOrderResponse {
  message: string;
  order: BackendOrder;
}

// Une commande unique (order-service via gateway) pour générer sa facture.
export function useGetOrder(id?: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async (): Promise<InvoiceOrder> => {
      const res = await api.get<GetOrderResponse>(`/orders/${id}`);
      const o = res.order;
      return {
        id: o.id,
        reference: `CMD-${o.id.slice(0, 8).toUpperCase()}`,
        customerEmail: o.customerEmail,
        billingAddress: o.billingAddress ?? undefined,
        items: o.items,
        totalCents: o.totalCents,
        status: o.status,
        createdAt: o.createdAt,
      };
    },
    enabled: !!id,
    retry: false,
  });
}

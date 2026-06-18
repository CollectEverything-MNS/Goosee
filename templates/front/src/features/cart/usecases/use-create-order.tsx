import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CartItem } from '../types';

export interface BillingAddress {
  fullName: string;
  line1: string;
  postalCode: string;
  city: string;
  country: string;
}

interface CreateOrderInput {
  customerEmail: string;
  items: CartItem[];
  customerId?: string;
  billingAddress?: BillingAddress;
}

interface OrderResponse {
  message: string;
  order: {
    id: string;
    totalCents: number;
    status: string;
  };
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const res = await api.post<OrderResponse>('/orders', input);
      return res.order;
    },
  });
}

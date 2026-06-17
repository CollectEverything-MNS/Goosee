import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CartItem } from '../types';

interface CreateOrderInput {
  customerEmail: string;
  items: CartItem[];
  customerId?: string;
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

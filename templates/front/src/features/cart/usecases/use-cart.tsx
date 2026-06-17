import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { getCartSessionKey } from '@/lib/cart-session';
import { Cart } from '../types';

interface CartResponse {
  message: string;
  cart: Cart;
}

export const cartQueryKey = (sessionKey: string) => ['cart', sessionKey];

export function useCart() {
  const sessionKey = typeof window !== 'undefined' ? getCartSessionKey() : '';

  return useQuery({
    queryKey: cartQueryKey(sessionKey),
    queryFn: async (): Promise<Cart> => {
      const res = await api.get<CartResponse>(`/cart/${sessionKey}`);
      return res.cart;
    },
    enabled: !!sessionKey,
  });
}

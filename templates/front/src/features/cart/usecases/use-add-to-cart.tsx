import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { getCartSessionKey } from '@/lib/cart-session';
import { AddCartItemInput, Cart } from '../types';
import { cartQueryKey } from './use-cart';

interface CartResponse {
  message: string;
  cart: Cart;
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddCartItemInput): Promise<Cart> => {
      const sessionKey = getCartSessionKey();
      const res = await api.post<CartResponse>(`/cart/${sessionKey}/items`, input);
      return res.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey(getCartSessionKey()), cart);
    },
  });
}

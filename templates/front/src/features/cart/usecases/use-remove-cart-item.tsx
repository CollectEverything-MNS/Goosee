import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { getCartSessionKey } from '@/lib/cart-session';
import { Cart } from '../types';
import { cartQueryKey } from './use-cart';

interface CartResponse {
  message: string;
  cart: Cart;
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string): Promise<Cart> => {
      const sessionKey = getCartSessionKey();
      const res = await api.delete<CartResponse>(`/cart/${sessionKey}/items/${productId}`);
      return res.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey(getCartSessionKey()), cart);
    },
  });
}

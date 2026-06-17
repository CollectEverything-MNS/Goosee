import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { getCartSessionKey } from '@/lib/cart-session';
import { Cart } from '../types';
import { cartQueryKey } from './use-cart';

interface CartResponse {
  message: string;
  cart: Cart;
}

interface UpdateItemInput {
  productId: string;
  quantity: number;
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: UpdateItemInput): Promise<Cart> => {
      const sessionKey = getCartSessionKey();
      const res = await api.patch<CartResponse>(`/cart/${sessionKey}/items/${productId}`, {
        quantity,
      });
      return res.cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey(getCartSessionKey()), cart);
    },
  });
}

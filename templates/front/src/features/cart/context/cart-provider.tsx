'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AddCartItemInput, CartItem } from '../types';
import { useCart } from '../usecases/use-cart';
import { useAddToCart } from '../usecases/use-add-to-cart';
import { useUpdateCartItem } from '../usecases/use-update-cart-item';
import { useRemoveCartItem } from '../usecases/use-remove-cart-item';
import { useClearCart } from '../usecases/use-clear-cart';
import { CartSheet } from '../components/cart-sheet';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  isLoading: boolean;
  isMutating: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (input: AddCartItemInput, options?: { openDrawer?: boolean }) => void;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const { data: cart, isLoading } = useCart();
  const addMutation = useAddToCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  const clearMutation = useClearCart();

  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCents = cart?.totalCents ?? 0;

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      totalCents,
      isLoading,
      isMutating:
        addMutation.isPending ||
        updateMutation.isPending ||
        removeMutation.isPending ||
        clearMutation.isPending,
      open,
      setOpen,
      addItem: (input, options) => {
        addMutation.mutate(input, {
          onSuccess: () => {
            toast.success(`${input.name} ajouté au panier`);
            if (options?.openDrawer) setOpen(true);
          },
          onError: () => toast.error("Impossible d'ajouter l'article au panier"),
        });
      },
      updateItem: (productId, quantity) => updateMutation.mutate({ productId, quantity }),
      removeItem: (productId) => removeMutation.mutate(productId),
      clear: () => clearMutation.mutate(),
    }),
    [
      items,
      itemCount,
      totalCents,
      isLoading,
      open,
      addMutation,
      updateMutation,
      removeMutation,
      clearMutation,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartSheet />
    </CartContext.Provider>
  );
}

// Renvoie null hors du CartProvider (ex. aperçu builder), pour un usage défensif.
export function useCartContext(): CartContextValue | null {
  return useContext(CartContext);
}

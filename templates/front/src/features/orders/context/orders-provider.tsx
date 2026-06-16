'use client';

import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { Order } from '../data/order.types';

type OrderDialogType = 'detail';

interface OrdersContextType {
  open: OrderDialogType | null;
  setOpen: (str: OrderDialogType | null) => void;
  currentRow: Order | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Order | null>>;
}

const OrdersContext = React.createContext<OrdersContextType | null>(null);

export default function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<OrderDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Order | null>(null);

  return (
    <OrdersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrder = () => {
  const ctx = React.useContext(OrdersContext);
  if (!ctx) throw new Error('useOrder must be used within <OrdersProvider>');
  return ctx;
};

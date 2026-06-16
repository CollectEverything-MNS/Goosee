'use client';

import React, { useState } from 'react';

import useDialogState from '@/hooks/use-dialog-state';

type ProductDialogType = 'create' | 'edit' | 'delete';

interface ProductContextType {
  open: ProductDialogType | null;
  setOpen: (str: ProductDialogType | null) => void;
  currentRow: any | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<any | null>>;
}

const ProductContext = React.createContext<ProductContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function ProductsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ProductDialogType>(null);
  const [currentRow, setCurrentRow] = useState<any | null>(null);

  return (
    <ProductContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProduct = () => {
  const ctx = React.useContext(ProductContext);
  if (!ctx) {
    throw new Error('useProduct must be used within <ProductsProvider>');
  }
  return ctx;
};

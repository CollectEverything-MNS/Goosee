'use client';

import React, { useState } from 'react';

import useDialogState from '@/hooks/use-dialog-state';

type StockDialogType = 'adjust';

interface StockContextType {
  open: StockDialogType | null;
  setOpen: (str: StockDialogType | null) => void;
  currentRow: any | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<any | null>>;
}

const StockContext = React.createContext<StockContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function StockProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<StockDialogType>(null);
  const [currentRow, setCurrentRow] = useState<any | null>(null);

  return (
    <StockContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StockContext.Provider>
  );
}

export const useStock = () => {
  const ctx = React.useContext(StockContext);
  if (!ctx) {
    throw new Error('useStock must be used within <StockProvider>');
  }
  return ctx;
};

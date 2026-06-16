'use client';

import React, { useState } from 'react';

import useDialogState from '@/hooks/use-dialog-state';

type CategoryDialogType = 'create' | 'edit' | 'delete';

interface CategoryContextType {
  open: CategoryDialogType | null;
  setOpen: (str: CategoryDialogType | null) => void;
  currentRow: any | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<any | null>>;
}

const CategoryContext = React.createContext<CategoryContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function CategoriesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<CategoryDialogType>(null);
  const [currentRow, setCurrentRow] = useState<any | null>(null);

  return (
    <CategoryContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategory = () => {
  const ctx = React.useContext(CategoryContext);
  if (!ctx) {
    throw new Error('useCategory must be used within <CategoriesProvider>');
  }
  return ctx;
};

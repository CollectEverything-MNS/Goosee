'use client';

import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { Menu } from '../types/menu.types';

type MenuDialogType = 'create' | 'edit' | 'delete';

interface MenuContextType {
  open: MenuDialogType | null;
  setOpen: (str: MenuDialogType | null) => void;
  currentRow: Menu | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Menu | null>>;
}

const MenuContext = React.createContext<MenuContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function MenuProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<MenuDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Menu | null>(null);

  return (
    <MenuContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => {
  const menuContext = React.useContext(MenuContext);

  if (!menuContext) {
    throw new Error('useMenu has to be used within <MenuProvider>');
  }

  return menuContext;
};

import React, { useState } from 'react';
import useDialogState from '@/hooks/use-dialog-state';
import { Role } from '../data/role.types';

type RoleDialogType = 'create' | 'edit' | 'delete';

interface RolesContextType {
  open: RoleDialogType | null;
  setOpen: (str: RoleDialogType | null) => void;
  currentRow: Role | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Role | null>>;
}

const RolesContext = React.createContext<RolesContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function RolesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<RoleDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Role | null>(null);

  return (
    <RolesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RolesContext.Provider>
  );
}

export const useRoles = () => {
  const ctx = React.useContext(RolesContext);
  if (!ctx) {
    throw new Error('useRoles has to be used within <RolesProvider>');
  }
  return ctx;
};

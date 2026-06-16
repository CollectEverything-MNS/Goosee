'use client';

import { ShieldCheck } from 'lucide-react';

import { PersonFormDialog } from '@/components/layout/admin/components/person-form-dialog';

import { useUser } from '../context/users-provider';
import { useRolesOptions } from '../data/roles.data';

export function UserFormDialog() {
  const { open, setOpen, currentRow, setCurrentRow } = useUser();
  const { options: rolesOptions } = useRolesOptions();

  const isEditing = open === 'edit' && !!currentRow;
  const isOpen = open === 'create' || open === 'edit';

  const handleClose = () => {
    setCurrentRow(null);
    setOpen(null);
  };

  return (
    <PersonFormDialog
      isOpen={isOpen}
      isEditing={isEditing}
      currentRow={currentRow}
      onClose={handleClose}
      translationsNamespace="admin.users"
      headerIcon={ShieldCheck}
      iconTone="admin"
      rolesOptions={rolesOptions}
      emailPlaceholder="admin@mail.com"
    />
  );
}

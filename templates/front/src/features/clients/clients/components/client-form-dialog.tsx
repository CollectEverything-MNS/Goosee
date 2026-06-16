'use client';

import { UserPlus } from 'lucide-react';

import { PersonFormDialog } from '@/components/layout/admin/components/person-form-dialog';
import { useRolesOptions } from '@/features/users/data/roles.data';

import { useClient } from '../context/clients-provider';

export function ClientFormDialog() {
  const { open, setOpen, currentRow, setCurrentRow } = useClient();
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
      translationsNamespace="admin.clients"
      headerIcon={UserPlus}
      iconTone="client"
      rolesOptions={rolesOptions}
      defaultRole="CUSTOMER"
      showRoleSelect={false}
      emailPlaceholder="client@mail.com"
    />
  );
}

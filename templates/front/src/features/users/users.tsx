'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import UsersProvider, { useUser } from '@/features/users/context/users-provider';
import { getUsersColumns } from '@/features/users/components/users-columns';
import { useListAdmins } from '@/features/users/usecases/use-list-admins';

import { UserDeleteDialog } from './components/user-delete-dialog';
import { UserFormDialog } from './components/user-form-dialog';
import { UsersListingToolbar } from './components/users-listing-toolbar';
import { useDetailUrlSync } from '@/hooks/use-detail-url-sync';

function UsersContent() {
  const t = useTranslations();
  const { open, setOpen, currentRow, setCurrentRow } = useUser();
  const { data: admins = [] } = useListAdmins();

  useDetailUrlSync({ items: admins, open, currentRow, setCurrentRow, setOpen, dialog: 'edit' });

  return (
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.users')}
        subtitle={t('admin.users.count', { count: admins.length })}
        actions={
          <Button onClick={() => setOpen('create')} className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.users.addNewUser')}
          </Button>
        }
      />
      <DataTable columns={getUsersColumns()} data={admins} Toolbar={UsersListingToolbar} />
      <UserFormDialog />
      <UserDeleteDialog />
    </div>
  );
}

export function Users() {
  return (
    <UsersProvider>
      <UsersContent />
    </UsersProvider>
  );
}

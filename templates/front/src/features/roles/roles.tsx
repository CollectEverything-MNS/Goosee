'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';

import RolesProvider, { useRoles } from './context/roles-provider';
import { getRolesColumns } from './components/roles-columns';
import { RolesListingToolbar } from './components/roles-listing-toolbar';
import { RoleFormDialog } from './components/role-form-dialog';
import { RoleDeleteDialog } from './components/role-delete-dialog';
import { useListRoles } from './usecases/use-list-roles';

function RolesContent() {
  const t = useTranslations();
  const { setOpen } = useRoles();
  const { data: roles = [] } = useListRoles();

  return (
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.roles')}
        subtitle={t('admin.roles.count', { count: roles.length })}
        actions={
          <Button onClick={() => setOpen('create')} className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.roles.addNewRole')}
          </Button>
        }
      />
      <DataTable columns={getRolesColumns()} data={roles} Toolbar={RolesListingToolbar} />
      <RoleFormDialog />
      <RoleDeleteDialog />
    </div>
  );
}

export function Roles() {
  return (
    <RolesProvider>
      <RolesContent />
    </RolesProvider>
  );
}

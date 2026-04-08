'use client';
import { DataTable } from '@/components/data-table/data-table';
import RolesProvider from './context/roles-provider';
import { getRolesColumns } from './components/roles-columns';
import { RolesListingToolbar } from './components/roles-listing-toolbar';
import { RoleFormDialog } from './components/role-form-dialog';
import { RoleDeleteDialog } from './components/role-delete-dialog';
import { useListRoles } from './usecases/use-list-roles';

export function Roles() {
  const { data: roles = [] } = useListRoles();

  return (
    <div>
      <RolesProvider>
        <DataTable columns={getRolesColumns()} data={roles} Toolbar={RolesListingToolbar} />
        <RoleFormDialog />
        <RoleDeleteDialog />
      </RolesProvider>
    </div>
  );
}

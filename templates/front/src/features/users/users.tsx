'use client';
import { DataTable } from '@/components/data-table/data-table';
import UsersProvider from '@/features/users/context/users-provider';
import { getUsersColumns } from '@/features/users/components/users-columns';
import { UsersListingToolbar } from './components/users-listing-toolbar';
import { useListAdmins } from '@/features/users/usecases/use-list-admins';

export function Users() {
  const { data: admins = [] } = useListAdmins();

  return (
    <div>
      <UsersProvider>
        <DataTable columns={getUsersColumns()} data={admins} Toolbar={UsersListingToolbar} />
      </UsersProvider>
    </div>
  )
}

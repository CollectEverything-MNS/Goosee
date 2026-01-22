'use client';
import { DataTable } from '@/components/data-table/data-table';
import UsersProvider from '@/features/users/context/users-provider';
import { getUsersColumns } from '@/features/users/components/users-columns';
import { UsersListingToolbar } from './components/users-listing-toolbar';

export function Users() {
  return (
    <div>
      <UsersProvider>
        <DataTable columns={getUsersColumns()} data={[]} Toolbar={UsersListingToolbar} />
      </UsersProvider>
    </div>
  )
}

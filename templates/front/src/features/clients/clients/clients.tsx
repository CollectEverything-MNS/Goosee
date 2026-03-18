'use client';
import { DataTable } from '@/components/data-table/data-table';
import { ClientsListingToolbar } from './components/clients-listing-toolbar';
import { getClientsColumns } from './components/clients-columns';
import ClientsProvider from './context/clients-provider';
import { ClientFormDialog } from './components/client-form-dialog';
import { ClientDeleteDialog } from './components/client-delete-dialog';
import { useListCustomers } from '@/features/users/usecases/use-list-customers';

export function Clients() {
  const { data: customers = [] } = useListCustomers();

  return (
    <div>
      <ClientsProvider>
        <DataTable columns={getClientsColumns()} data={customers} Toolbar={ClientsListingToolbar} />
        <ClientFormDialog />
        <ClientDeleteDialog />
      </ClientsProvider>
    </div>
  )
}

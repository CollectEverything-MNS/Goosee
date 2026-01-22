'use client';
import { DataTable } from '@/components/data-table/data-table';
import { ClientsListingToolbar } from './components/clients-listing-toolbar';
import { getClientsColumns } from './components/clients-columns';
import ClientsProvider from './context/clients-provider';

export function Clients() {
  return (
    <div>
      <ClientsProvider>
        <DataTable columns={getClientsColumns()} data={[]} Toolbar={ClientsListingToolbar} />
      </ClientsProvider>
    </div>
  )
}

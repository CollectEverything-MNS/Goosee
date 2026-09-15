'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { useListCustomers } from '@/features/users/usecases/use-list-customers';

import ClientsProvider, { useClient } from './context/clients-provider';
import { ClientDeleteDialog } from './components/client-delete-dialog';
import { ClientFormDialog } from './components/client-form-dialog';
import { ClientRgpdEraseDialog } from './components/client-rgpd-erase-dialog';
import { ClientsListingToolbar } from './components/clients-listing-toolbar';
import { getClientsColumns } from './components/clients-columns';
import { useDetailUrlSync } from '@/hooks/use-detail-url-sync';

function ClientsContent() {
  const t = useTranslations();
  const { open, setOpen, currentRow, setCurrentRow } = useClient();
  const { data: customers = [] } = useListCustomers();

  useDetailUrlSync({ items: customers, open, currentRow, setCurrentRow, setOpen, dialog: 'edit' });

  return (
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.clients')}
        subtitle={t('admin.clients.count', { count: customers.length })}
        actions={
          <Button onClick={() => setOpen('create')} className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.clients.addNewClient')}
          </Button>
        }
      />
      <DataTable columns={getClientsColumns()} data={customers} Toolbar={ClientsListingToolbar} />
      <ClientFormDialog />
      <ClientDeleteDialog />
      <ClientRgpdEraseDialog />
    </div>
  );
}

export function Clients() {
  return (
    <ClientsProvider>
      <ClientsContent />
    </ClientsProvider>
  );
}

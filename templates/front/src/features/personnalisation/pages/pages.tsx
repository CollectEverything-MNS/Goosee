'use client';
import PagesProvider from '@/features/personnalisation/pages/context/pages-provider';
import { DataTable } from '@/components/data-table/data-table';
import { usePagesColumns } from '@/features/personnalisation/pages/components/pages-columns';
import { Loader2 } from 'lucide-react';
import { usePages } from './usecases/list-pages/use-list-pages';
import { LoaderError } from '@/components/ux/loader-error';
import { PagesListingToolbar } from '@/features/personnalisation/pages/components/pages-listing-toolbar';

export function Pages() {
  const { data, isLoading, error } = usePages();
  const columns = usePagesColumns()
  const pages = data || [];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <LoaderError message={error.message} />;
  }

  return (
    <div>
      <PagesProvider>
        <DataTable
          columns={columns}
          data={pages}
          Toolbar={PagesListingToolbar}
        />
      </PagesProvider>
    </div>
  )
}

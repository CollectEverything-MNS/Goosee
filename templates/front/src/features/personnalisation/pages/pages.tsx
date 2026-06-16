'use client';

import { LayoutTemplate, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { LoaderError } from '@/components/ux/loader-error';
import PagesProvider from '@/features/personnalisation/pages/context/pages-provider';
import { usePagesColumns } from '@/features/personnalisation/pages/components/pages-columns';
import { PagesListingToolbar } from '@/features/personnalisation/pages/components/pages-listing-toolbar';
import { TemplatesPickerDialog } from '@/features/personnalisation/templates/components/templates-picker-dialog';

import { Page } from './types/page.types';
import { usePages } from './usecases/list-pages/use-list-pages';

export function Pages() {
  const t = useTranslations();
  const locale = useLocale();
  const { data, isLoading, error } = usePages();
  const columns = usePagesColumns();
  const pages = (Array.isArray(data) ? data : []) as Page[];
  const [templatesOpen, setTemplatesOpen] = useState(false);

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
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.pages')}
        subtitle={t('admin.pages.count', { count: pages.length })}
        actions={
          <>
            <Button variant="outline" className="h-10 gap-2" onClick={() => setTemplatesOpen(true)}>
              <LayoutTemplate className="h-4 w-4" />
              {t('admin.pages.applyTemplate')}
            </Button>
            <Link href={`/${locale}/goosee-admin/pages/create`}>
              <Button className="h-10 gap-2">
                <Plus className="h-4 w-4" />
                {t('admin.pages.addNewPage')}
              </Button>
            </Link>
          </>
        }
      />
      <PagesProvider>
        <DataTable columns={columns} data={pages} Toolbar={PagesListingToolbar} />
      </PagesProvider>
      <TemplatesPickerDialog open={templatesOpen} onOpenChange={setTemplatesOpen} />
    </div>
  );
}

'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DataTableFilter } from '@/components/data-table/data-table-filter';
import { Button } from '@/components/ui/button';

interface Props {
  table: any;
}

export function CategoriesListingToolbar({ table }: Props) {
  const t = useTranslations('admin.categories');
  const isFiltered = table.getState().columnFilters.length > 0;

  const statusOptions = [
    { value: 'true', label: t('table.active') },
    { value: 'false', label: t('table.inactive') },
  ];

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <DataTableFilter
          title={t('table.status')}
          options={statusOptions}
          column="isActive"
          table={table}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="h-9 text-muted-foreground"
          >
            {t('clearFilters')}
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="relative w-full sm:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

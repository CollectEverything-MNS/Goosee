'use client';

import { DataTableSearch } from '@/components/data-table/data-table-search';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { DataTableFilter } from '@/components/data-table/data-table-filter';
import { Button } from '@/components/ui/button';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMenu } from '../context/menu-provider';

interface Props {
  table: any;
}

export function MenuListingToolbar({ table }: Props) {
  const t = useTranslations();
  const isFiltered = table.getState().columnFilters.length > 0;
  const { setOpen, setCurrentRow } = useMenu();

  const statusOptions = [
    { label: t('admin.menu.status.active'), value: 'true' },
    { label: t('admin.menu.status.inactive'), value: 'false' },
  ];

  const handleAddNew = () => {
    setCurrentRow(null);
    setOpen('create');
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-x-3">
        <DataTableViewOptions table={table} />
        <DataTableSearch table={table} />
        <DataTableFilter
          title={t('admin.menu.filter.status')}
          options={statusOptions}
          column="isActive"
          table={table}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t('admin.cancel')}
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center">
        <Button variant="default" onClick={handleAddNew}>
          <Plus /> <span className="hidden md:block">{t('admin.menu.addNew')}</span>
        </Button>
      </div>
    </div>
  );
}

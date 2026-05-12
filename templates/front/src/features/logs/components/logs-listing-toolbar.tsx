import { useMemo } from 'react';
import { DataTableSearch } from '@/components/data-table/data-table-search';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { DataTableFilter } from '@/components/data-table/data-table-filter';
import { Button } from '@/components/ui/button';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { LogLevel } from '../data/log.types';

const ALL_LEVELS: LogLevel[] = ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'CRITICAL', 'DEBUG'];

interface Props {
  table: any;
}

export function LogsListingToolbar({ table }: Props) {
  const t = useTranslations();
  const tLevels = useTranslations('admin.logs.levels');
  const isFiltered = table.getState().columnFilters.length > 0;

  const levelOptions = useMemo(
    () => ALL_LEVELS.map((l) => ({ value: l, label: tLevels(l) })),
    [tLevels]
  );

  const serviceOptions = useMemo(() => {
    const seen = new Set<string>();
    table.getCoreRowModel().flatRows.forEach((row: any) => {
      const svc = row.original?.service;
      if (svc) seen.add(svc);
    });
    return Array.from(seen)
      .sort()
      .map((s) => ({ value: s, label: s }));
  }, [table.getCoreRowModel().flatRows.length]);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-x-3">
        <DataTableViewOptions table={table} />
        <DataTableSearch table={table} />
        <DataTableFilter
          title={t('admin.logs.table.level')}
          options={levelOptions}
          column="level"
          table={table}
        />
        <DataTableFilter
          title={t('admin.logs.table.service')}
          options={serviceOptions}
          column="service"
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
    </div>
  );
}

import { DataTableSearch } from '@/components/data-table/data-table-search';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { DataTableFilter } from '@/components/data-table/data-table-filter';
import { Button } from '@/components/ui/button';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useRolesOptions } from '@/features/users/data/roles.data';

interface Props {
  table: any
}

export function ClientsListingToolbar({ table }: Props) {
  const t = useTranslations()
  const { options: rolesOptions } = useRolesOptions()
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between gap-2">
      <div className={'flex items-center gap-x-3'}>
        <DataTableViewOptions table={table} />
        <DataTableSearch table={table} />
        <DataTableFilter
          title={t('admin.clients.table.role')}
          options={rolesOptions}
          column="role"
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
  )
}

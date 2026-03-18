import { DataTableSearch } from '@/components/data-table/data-table-search';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { DataTableFilter } from '@/components/data-table/data-table-filter';
import { Button } from '@/components/ui/button';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useClient } from '../context/clients-provider';
import { ROLES_LIST } from '@/features/users/data/roles.data';

interface Props {
  table: any
}

export function ClientsListingToolbar({ table }: Props) {
  const t = useTranslations()
  const { setOpen } = useClient()
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between gap-2">
      <div className={'flex items-center gap-x-3'}>
        <DataTableViewOptions table={table} />
        <DataTableSearch table={table} />
        <DataTableFilter
          title={t('admin.clients.table.role')}
          options={ROLES_LIST}
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
      <div className={'flex items-center'}>
        <Button variant="default" onClick={() => setOpen('create')}>
          <Plus /> <div className={'hidden md:block'}>{t('admin.clients.addNewClient')}</div>
        </Button>
      </div>
    </div>
  )
}

import { DataTableSearch } from '@/components/data-table/data-table-search';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUser } from '../context/users-provider';

interface Props {
  table: any
}

export function UsersListingToolbar({ table }: Props) {
  const t = useTranslations()
  const { setOpen } = useUser()
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between gap-2">
      <div className={'flex items-center gap-x-3'}>
        <DataTableViewOptions table={table} />
        <DataTableSearch table={table} />
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
          <Plus /> <div className={'hidden md:block'}>{t('admin.users.addNewUser')}</div>
        </Button>
      </div>
    </div>
  )
}

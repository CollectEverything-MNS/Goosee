import { DataTableSearch } from '@/components/data-table/data-table-search'
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'
import { DataTableFilter } from '@/components/data-table/data-table-filter'
import { Button } from '@/components/ui/button'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useTranslations } from 'next-intl'
import { PageStatus } from '../types/page.types'

interface Props {
  table: any
}

export function PagesListingToolbar({ table }: Props) {
  const t = useTranslations()
  const isFiltered = table.getState().columnFilters.length > 0

  const statusOptions = [
    { label: t('admin.pages.status.draft'), value: PageStatus.DRAFT },
    { label: t('admin.pages.status.published'), value: PageStatus.PUBLISHED },
  ]

  return (
    <div className="flex items-center justify-between gap-2">
      <div className={'flex items-center gap-x-3'}>
        <DataTableViewOptions table={table} />
        <DataTableSearch table={table} />
        <DataTableFilter
          title={t('admin.pages.filter.status')}
          options={statusOptions}
          column="status"
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

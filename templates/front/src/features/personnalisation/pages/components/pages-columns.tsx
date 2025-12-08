import { Checkbox } from '@/components/ui/checkbox'
import { PagesTableActions } from '@/features/personnalisation/pages/components/pages-table-actions'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

export function getPagesColumns(): ColumnDef<any>[] {
  const t = useTranslations()
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    { accessorKey: 'title', header: t('admin.pages.table.title') },
    { accessorKey: 'status', header: t('admin.pages.table.status') },
    {
      id: 'actions',
      header: t('admin.pages.table.actions'),
      cell: PagesTableActions,
    },
  ]
}

import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { ClientsTableActions } from './clients-table-actions';

export function getClientsColumns(): ColumnDef<any>[] {
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

    { accessorKey: 'firstname', header: t('admin.clients.table.firstname') },
    { accessorKey: 'lastname', header: t('admin.clients.table.lastname') },
    { accessorKey: 'email', header: t('admin.clients.table.email') },
    { accessorKey: 'status', header: t('admin.clients.table.status') },
    {
      id: 'actions',
      header: t('admin.clients.table.actions'),
      cell: ClientsTableActions,
    },
  ]
}

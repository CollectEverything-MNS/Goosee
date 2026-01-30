import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { UsersTableActions } from '@/features/users/components/users-table-actions';

export function getUsersColumns(): ColumnDef<any>[] {
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

    { accessorKey: 'firstname', header: t('admin.users.table.firstname') },
    { accessorKey: 'lastname', header: t('admin.users.table.lastname') },
    { accessorKey: 'email', header: t('admin.users.table.email') },
    { accessorKey: 'role', header: t('admin.users.table.role') },
    { accessorKey: 'status', header: t('admin.users.table.status') },
    {
      id: 'actions',
      header: t('admin.users.table.actions'),
      cell: UsersTableActions,
    },
  ]
}

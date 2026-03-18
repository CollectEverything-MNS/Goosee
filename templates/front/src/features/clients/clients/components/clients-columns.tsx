import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { ClientsTableActions } from './clients-table-actions';
import { ROLES_DATA, RoleKey } from '@/features/users/data/roles.data';

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

    { accessorKey: 'firstName', header: t('admin.clients.table.firstname') },
    { accessorKey: 'lastName', header: t('admin.clients.table.lastname') },
    { accessorKey: 'email', header: t('admin.clients.table.email') },
    {
      accessorKey: 'role',
      header: t('admin.clients.table.role'),
      filterFn: (row, columnId, filterValue) => {
        const roles: string[] = row.getValue(columnId) ?? [];
        return roles.includes(filterValue);
      },
      cell: ({ row }) => {
        const roles: string[] = row.getValue('role') ?? [];
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((r) => {
              const data = ROLES_DATA[r as RoleKey];
              return (
                <Badge key={r} variant="outline" className={data?.badgeClass ?? ''}>
                  {data?.label ?? r}
                </Badge>
              );
            })}
          </div>
        );
      },
    },
    { accessorKey: 'status', header: t('admin.clients.table.status') },
    {
      id: 'actions',
      header: t('admin.clients.table.actions'),
      cell: ClientsTableActions,
    },
  ]
}

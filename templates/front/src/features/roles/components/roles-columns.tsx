import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { RolesTableActions } from './roles-table-actions';
import { Role } from '../data/role.types';
import { useRoleLabel } from '@/features/users/data/roles.data';

export function getRolesColumns(): ColumnDef<Role>[] {
  const t = useTranslations();
  const getRoleLabel = useRoleLabel();

  return [
    {
      accessorKey: 'name',
      header: t('admin.roles.table.name'),
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{getRoleLabel(role.name)}</span>
            {role.isSystem && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                {t('admin.roles.system')}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: t('admin.roles.table.description'),
      cell: ({ row }) => row.original.description ?? '—',
    },
    {
      accessorKey: 'pageKeys',
      header: t('admin.roles.table.pages'),
      cell: ({ row }) => {
        const count = row.original.pageKeys?.length ?? 0;
        return (
          <Badge variant="outline">
            {t('admin.roles.table.pagesCount', { count })}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: t('admin.roles.table.actions'),
      cell: RolesTableActions,
    },
  ];
}

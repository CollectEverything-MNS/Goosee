import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import { AdminStatusBadge } from '@/components/layout/admin/components/admin-status-badge';
import { useRoleLabel } from '@/features/users/data/roles.data';

import { Role } from '../data/role.types';
import { RolesTableActions } from './roles-table-actions';

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
            <span className="font-medium text-foreground">{getRoleLabel(role.name)}</span>
            {role.isSystem && (
              <AdminStatusBadge tone="accent">{t('admin.roles.system')}</AdminStatusBadge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: t('admin.roles.table.description'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.description ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'pageKeys',
      header: t('admin.roles.table.pages'),
      cell: ({ row }) => {
        const count = row.original.pageKeys?.length ?? 0;
        return (
          <AdminStatusBadge tone="neutral">
            {t('admin.roles.table.pagesCount', { count })}
          </AdminStatusBadge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: RolesTableActions,
    },
  ];
}

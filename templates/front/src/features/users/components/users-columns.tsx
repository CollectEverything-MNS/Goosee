import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import { AdminAvatar } from '@/components/layout/admin/components/admin-avatar';
import { AdminStatusBadge } from '@/components/layout/admin/components/admin-status-badge';
import { UsersTableActions } from '@/features/users/components/users-table-actions';

import { useRoleLabel } from '../data/roles.data';

function formatDate(value: string | undefined, locale: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function getUsersColumns(): ColumnDef<any>[] {
  const t = useTranslations();
  const getRoleLabel = useRoleLabel();

  return [
    {
      id: 'user',
      header: t('admin.users.table.firstname'),
      accessorFn: (row) => `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim(),
      cell: ({ row }) => {
        const u = row.original;
        const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
        return (
          <div className="flex items-center gap-3">
            <AdminAvatar firstName={u.firstName} lastName={u.lastName} email={u.email} size="md" />
            <span className="font-medium text-foreground">{fullName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: t('admin.users.table.email'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: t('admin.users.table.role'),
      filterFn: (row, columnId, filterValue) => {
        const roles: string[] = row.getValue(columnId) ?? [];
        return roles.includes(filterValue);
      },
      cell: ({ row }) => {
        const roles: string[] = row.getValue('role') ?? [];
        if (roles.length === 0) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((r) => (
              <AdminStatusBadge key={r} tone="info">
                {getRoleLabel(r)}
              </AdminStatusBadge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('admin.users.table.status'),
      cell: ({ row }) => {
        const status: string = row.original.status || 'active';
        const tone = status === 'active' ? 'success' : status === 'banned' ? 'danger' : 'neutral';
        const labelMap: Record<string, string> = {
          active: t('admin.users.statusValues.active'),
          inactive: t('admin.users.statusValues.inactive'),
          banned: t('admin.users.statusValues.banned'),
        };
        return (
          <AdminStatusBadge tone={tone} withDot>
            {labelMap[status] ?? status}
          </AdminStatusBadge>
        );
      },
    },
    {
      id: 'createdAt',
      header: t('admin.users.table.createdAt'),
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.createdAt, 'fr-FR')}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: UsersTableActions,
    },
  ];
}

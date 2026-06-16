import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import { AdminAvatar } from '@/components/layout/admin/components/admin-avatar';
import { AdminStatusBadge } from '@/components/layout/admin/components/admin-status-badge';
import { useRoleLabel } from '@/features/users/data/roles.data';

import { ClientsTableActions } from './clients-table-actions';

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

export function getClientsColumns(): ColumnDef<any>[] {
  const t = useTranslations()
  const getRoleLabel = useRoleLabel()

  return [
    {
      id: 'client',
      header: t('admin.clients.table.firstname'),
      accessorFn: (row) => `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim(),
      cell: ({ row }) => {
        const c = row.original;
        const fullName = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email;
        return (
          <div className="flex items-center gap-3">
            <AdminAvatar firstName={c.firstName} lastName={c.lastName} email={c.email} size="md" />
            <span className="font-medium text-foreground">{fullName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: t('admin.clients.table.email'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: t('admin.clients.table.role'),
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
      header: t('admin.clients.table.status'),
      cell: ({ row }) => {
        const status: string = row.original.status || 'active';
        const tone = status === 'active' ? 'success' : status === 'banned' ? 'danger' : 'neutral';
        return (
          <AdminStatusBadge tone={tone} withDot>
            {status}
          </AdminStatusBadge>
        );
      },
    },
    {
      id: 'createdAt',
      header: t('admin.clients.table.createdAt') ?? 'Created at',
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.createdAt, 'fr-FR')}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ClientsTableActions,
    },
  ]
}

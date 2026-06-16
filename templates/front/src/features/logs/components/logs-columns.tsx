import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Calendar } from 'lucide-react';

import { AdminStatusBadge, AdminStatusTone } from '@/components/layout/admin/components/admin-status-badge';

import { Log, LogLevel } from '../data/log.types';

const LEVEL_TONE: Record<LogLevel, AdminStatusTone> = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'danger',
  CRITICAL: 'accent',
  DEBUG: 'neutral',
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('fr-FR');
  } catch {
    return iso;
  }
};

export function getLogsColumns(): ColumnDef<Log>[] {
  const t = useTranslations();
  const tLevels = useTranslations('admin.logs.levels');

  return [
    {
      accessorKey: 'createdAt',
      header: t('admin.logs.table.date'),
      cell: ({ row }) => (
        <AdminStatusBadge tone="neutral">
          <Calendar className="h-3 w-3" />
          {formatDate(row.original.createdAt)}
        </AdminStatusBadge>
      ),
    },
    {
      accessorKey: 'level',
      header: t('admin.logs.table.level'),
      filterFn: (row, columnId, filterValue) => {
        return row.getValue(columnId) === filterValue;
      },
      cell: ({ row }) => {
        const level = row.original.level;
        if (!level) return <span className="text-muted-foreground">—</span>;
        return (
          <AdminStatusBadge tone={LEVEL_TONE[level]} withDot>
            {tLevels(level)}
          </AdminStatusBadge>
        );
      },
    },
    {
      accessorKey: 'service',
      header: t('admin.logs.table.service'),
      filterFn: (row, columnId, filterValue) => {
        return row.getValue(columnId) === filterValue;
      },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.service ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'message',
      header: t('admin.logs.table.message'),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.message}</span>
      ),
    },
    {
      accessorKey: 'userId',
      header: t('admin.logs.table.userId'),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.userId ?? '—'}
        </span>
      ),
    },
  ];
}

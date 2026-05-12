import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Calendar } from 'lucide-react';
import { Log, LogLevel } from '../data/log.types';

const LEVEL_BADGE: Record<LogLevel, string> = {
  INFO: 'bg-blue-100 text-blue-800 border-blue-200',
  SUCCESS: 'bg-green-100 text-green-800 border-green-200',
  WARNING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ERROR: 'bg-red-100 text-red-800 border-red-200',
  CRITICAL: 'bg-purple-100 text-purple-800 border-purple-200',
  DEBUG: 'bg-gray-100 text-gray-800 border-gray-200',
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
        <Badge
          variant="outline"
          className="gap-1 bg-gray-100 text-gray-700 border-gray-200 font-normal"
        >
          <Calendar className="h-3 w-3" />
          {formatDate(row.original.createdAt)}
        </Badge>
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
        if (!level) return '—';
        return (
          <Badge variant="outline" className={LEVEL_BADGE[level]}>
            {tLevels(level)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'service',
      header: t('admin.logs.table.service'),
      filterFn: (row, columnId, filterValue) => {
        return row.getValue(columnId) === filterValue;
      },
      cell: ({ row }) => row.original.service ?? '—',
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

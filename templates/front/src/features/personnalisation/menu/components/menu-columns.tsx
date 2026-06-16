'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { AdminStatusBadge } from '@/components/layout/admin/components/admin-status-badge';
import { MenuTableActions } from './menu-table-actions';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Menu } from '../types/menu.types';
import { ExternalLink, FileText, ChevronRight } from 'lucide-react';

export function useMenuColumns(): ColumnDef<Menu>[] {
  const t = useTranslations();

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
    {
      accessorKey: 'label',
      header: t('admin.menu.table.label'),
      cell: ({ row }) => {
        const menu = row.original;
        const hasChildren = menu.children && menu.children.length > 0;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{menu.label}</span>
            {hasChildren && (
              <AdminStatusBadge tone="neutral">
                <ChevronRight className="h-3 w-3" />
                {menu.children?.length}
              </AdminStatusBadge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: t('admin.menu.table.type'),
      cell: ({ row }) => {
        const menu = row.original;
        if (menu.pageId) {
          return (
            <AdminStatusBadge tone="info">
              <FileText className="h-3 w-3" />
              {t('admin.menu.type.page')}
            </AdminStatusBadge>
          );
        }
        if (menu.externalUrl) {
          return (
            <AdminStatusBadge tone="accent">
              <ExternalLink className="h-3 w-3" />
              {t('admin.menu.type.external')}
            </AdminStatusBadge>
          );
        }
        return <AdminStatusBadge tone="neutral">{t('admin.menu.type.none')}</AdminStatusBadge>;
      },
    },
    {
      accessorKey: 'isActive',
      header: t('admin.menu.table.status'),
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <AdminStatusBadge tone={isActive ? 'success' : 'neutral'} withDot>
            {isActive ? t('admin.menu.status.active') : t('admin.menu.status.inactive')}
          </AdminStatusBadge>
        );
      },
    },
    {
      accessorKey: 'order',
      header: t('admin.menu.table.order'),
      cell: ({ row }) => {
        return <span className="text-muted-foreground">{row.getValue('order')}</span>;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <MenuTableActions row={row} />,
    },
  ];
}

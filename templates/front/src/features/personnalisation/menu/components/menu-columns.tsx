'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
            <span className="font-medium">{menu.label}</span>
            {hasChildren && (
              <Badge variant="outline" className="text-xs">
                <ChevronRight className="h-3 w-3 mr-1" />
                {menu.children?.length}
              </Badge>
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
            <Badge variant="secondary">
              <FileText className="h-3 w-3 mr-1" />
              {t('admin.menu.type.page')}
            </Badge>
          );
        }
        if (menu.externalUrl) {
          return (
            <Badge variant="outline">
              <ExternalLink className="h-3 w-3 mr-1" />
              {t('admin.menu.type.external')}
            </Badge>
          );
        }
        return <Badge variant="outline">{t('admin.menu.type.none')}</Badge>;
      },
    },
    {
      accessorKey: 'isActive',
      header: t('admin.menu.table.status'),
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? t('admin.menu.status.active') : t('admin.menu.status.inactive')}
          </Badge>
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
      header: t('admin.menu.table.actions'),
      cell: ({ row }) => <MenuTableActions row={row} />,
    },
  ];
}

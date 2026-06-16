'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Tags } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { AdminStatusBadge } from '@/components/layout/admin/components/admin-status-badge';

import { CategoriesTableActions } from './categories-table-actions';

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

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

interface UseColumnsArgs {
  productCountByCategory: Record<string, number>;
}

export function useCategoriesColumns({
  productCountByCategory,
}: UseColumnsArgs): ColumnDef<Category>[] {
  const t = useTranslations('admin.categories.table');
  const locale = useLocale();

  return [
    {
      id: 'category',
      header: t('category'),
      accessorFn: (row) => row.name,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
              ) : (
                <Tags className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-foreground">{c.name}</div>
              {c.description && (
                <div className="truncate text-xs text-muted-foreground">{c.description}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'productCount',
      header: t('productCount'),
      accessorFn: (row) => productCountByCategory[row.id] ?? 0,
      cell: ({ row }) => {
        const count = productCountByCategory[row.original.id] ?? 0;
        return (
          <span className="font-medium text-foreground">
            {count} {count === 1 ? t('product') : t('products')}
          </span>
        );
      },
    },
    {
      accessorKey: 'order',
      header: t('order'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">#{row.original.order ?? 0}</span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: t('status'),
      filterFn: (row, _columnId, filterValue) =>
        String(row.original.isActive) === String(filterValue),
      cell: ({ row }) => (
        <AdminStatusBadge tone={row.original.isActive ? 'success' : 'neutral'} withDot>
          {row.original.isActive ? t('active') : t('inactive')}
        </AdminStatusBadge>
      ),
    },
    {
      id: 'createdAt',
      header: t('createdAt'),
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.createdAt, locale)}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: CategoriesTableActions,
    },
  ];
}

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { AdminStatusBadge } from '@/components/layout/admin/components/admin-status-badge';
import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes.config';
import { useGetProduct } from '@/features/products/usecases/use-get-product';

import { useListStockMovements, type StockMovement } from '../../usecases/use-list-stock-movements';

function formatDateTime(value: string, locale: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function movementType(movement: StockMovement): 'sale' | 'restock' | 'correction' {
  if (movement.orderId) return 'sale';
  return movement.delta > 0 ? 'restock' : 'correction';
}

interface Props {
  productId: string;
}

export function StockMovements({ productId }: Props) {
  const t = useTranslations('admin.stock.movements');
  const locale = useLocale();
  const { data: movements = [], isLoading } = useListStockMovements(productId);
  const { data: product } = useGetProduct(productId);

  const columns = useMemo<ColumnDef<StockMovement>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: t('columns.date'),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDateTime(row.original.createdAt, locale)}
          </span>
        ),
      },
      {
        accessorKey: 'delta',
        header: t('columns.delta'),
        cell: ({ row }) => {
          const delta = row.original.delta;
          return (
            <span
              className={delta > 0 ? 'font-medium text-emerald-600' : 'font-medium text-rose-600'}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          );
        },
      },
      {
        id: 'type',
        header: t('columns.type'),
        cell: ({ row }) => {
          const type = movementType(row.original);
          const tone = type === 'sale' ? 'info' : type === 'restock' ? 'success' : 'neutral';
          return (
            <AdminStatusBadge tone={tone} withDot>
              {t(`types.${type}`)}
            </AdminStatusBadge>
          );
        },
      },
      {
        accessorKey: 'orderId',
        header: t('columns.order'),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.orderId ?? '—'}</span>
        ),
      },
    ],
    [t, locale]
  );

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
        <Link href={routes.gooseeAdmin.stock.getHref(locale)}>
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>
      </Button>
      <AdminTitle size="h1" title={t('title')} subtitle={product?.name ?? productId} />
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable columns={columns} data={movements} />
      )}
    </div>
  );
}

'use client';

import { ColumnDef, Row } from '@tanstack/react-table';
import { Eye, ShoppingBag } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { AdminStatusBadge, AdminStatusTone } from '@/components/layout/admin/components/admin-status-badge';
import { Button } from '@/components/ui/button';

import { useOrder } from '../../context/orders-provider';
import { Order, OrderStatus } from '../../data/order.types';

const STATUS_TONE: Record<OrderStatus, AdminStatusTone> = {
  pending: 'warning',
  paid: 'info',
  prepared: 'accent',
  shipped: 'success',
  cancelled: 'danger',
};

function formatDate(value: string, locale: string) {
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

function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function ViewAction({ row }: { row: Row<Order> }) {
  const { setCurrentRow, setOpen } = useOrder();
  const t = useTranslations('admin.orders');
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-2"
      onClick={() => {
        setCurrentRow(row.original);
        setOpen('detail');
      }}
    >
      <Eye className="h-4 w-4" />
      <span className="hidden md:inline">{t('actions.view')}</span>
    </Button>
  );
}

export function useOrdersColumns(): ColumnDef<Order>[] {
  const t = useTranslations('admin.orders');
  const tStatus = useTranslations('admin.orders.statusValues');
  const locale = useLocale();

  return [
    {
      id: 'reference',
      header: t('table.reference'),
      accessorFn: (row) => row.reference,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <span className="font-medium text-foreground">{row.original.reference}</span>
        </div>
      ),
    },
    {
      id: 'customer',
      header: t('table.customer'),
      accessorFn: (row) => `${row.customer.firstName} ${row.customer.lastName}`,
      cell: ({ row }) => {
        const c = row.original.customer;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {c.firstName} {c.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{c.email}</span>
          </div>
        );
      },
    },
    {
      id: 'items',
      header: t('table.items'),
      accessorFn: (row) => row.items.reduce((acc, i) => acc + i.quantity, 0),
      cell: ({ row }) => {
        const count = row.original.items.reduce((acc, i) => acc + i.quantity, 0);
        return (
          <AdminStatusBadge tone="neutral">
            {t('table.itemsCount', { count })}
          </AdminStatusBadge>
        );
      },
    },
    {
      accessorKey: 'total',
      header: t('table.total'),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{formatPrice(row.original.total, locale)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('table.status'),
      filterFn: (row, columnId, filterValue) => row.getValue(columnId) === filterValue,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <AdminStatusBadge tone={STATUS_TONE[status]} withDot>
            {tStatus(status)}
          </AdminStatusBadge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: t('table.createdAt'),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.createdAt, locale)}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ViewAction,
    },
  ];
}

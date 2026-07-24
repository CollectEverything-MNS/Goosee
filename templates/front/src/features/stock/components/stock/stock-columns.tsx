'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Package } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AdminStatusBadge } from '@/components/layout/admin/components/admin-status-badge';

import { StockTableActions } from './stock-table-actions';

interface ProductImage {
  url: string;
  isMain: boolean;
}

export interface StockRow {
  productId: string;
  quantity: number;
  available: number;
  product?: {
    id: string;
    name: string;
    images?: ProductImage[];
  };
}

function mainImage(images?: ProductImage[]): string | undefined {
  if (!Array.isArray(images) || images.length === 0) return undefined;
  return (images.find((img) => img.isMain) ?? images[0]).url;
}

export function useStockColumns(): ColumnDef<StockRow>[] {
  const t = useTranslations('admin.stock.table');

  return [
    {
      id: 'product',
      header: t('product'),
      accessorFn: (row) => row.product?.name ?? row.productId,
      cell: ({ row }) => {
        const p = row.original.product;
        const img = mainImage(p?.images);
        const name = p?.name ?? row.original.productId;
        return (
          <div className="flex items-center gap-3">
            {img ? (
              <img
                src={img}
                alt={name}
                className="h-10 w-10 shrink-0 rounded-lg border object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                <Package className="h-4 w-4" strokeWidth={1.75} />
              </div>
            )}
            <span className="truncate font-medium text-foreground">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'quantity',
      header: t('quantity'),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: 'available',
      header: t('available'),
      cell: ({ row }) => {
        const available = row.original.available;
        const tone = available <= 0 ? 'danger' : available < 10 ? 'warning' : 'success';
        return (
          <AdminStatusBadge tone={tone} withDot>
            {available}
          </AdminStatusBadge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: StockTableActions,
    },
  ];
}

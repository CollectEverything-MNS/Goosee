'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Package } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { AdminStatusBadge } from '@/components/layout/admin/components/admin-status-badge';

import { ProductsTableActions } from './products-table-actions';

interface ProductImage {
  url: string;
  isMain: boolean;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  categoryId: string;
  categoryIds?: string[];
  preparationTime?: number;
  sizeValue?: number;
  sizeUnit?: string;
  createdAt: string;
  images?: ProductImage[];
}

function mainImage(images?: ProductImage[]): string | undefined {
  if (!Array.isArray(images) || images.length === 0) return undefined;
  return (images.find((img) => img.isMain) ?? images[0]).url;
}

const ICON_PALETTE = [
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-cyan-100 text-cyan-700',
  'bg-lime-100 text-lime-700',
];

function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return ICON_PALETTE[Math.abs(h) % ICON_PALETTE.length];
}

function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
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
  categoriesById: Record<string, string>;
}

export function useProductsColumns({ categoriesById }: UseColumnsArgs): ColumnDef<Product>[] {
  const t = useTranslations('admin.products.table');
  const locale = useLocale();

  return [
    {
      id: 'product',
      header: t('product'),
      accessorFn: (row) => row.name,
      cell: ({ row }) => {
        const p = row.original;
        const img = mainImage(p.images);
        return (
          <div className="flex items-center gap-3">
            {img ? (
              <img
                src={img}
                alt={p.name}
                className="h-10 w-10 shrink-0 rounded-lg border object-cover"
              />
            ) : (
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorFor(p.name || p.id)}`}
              >
                <Package className="h-4 w-4" strokeWidth={1.75} />
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate font-medium text-foreground">{p.name}</div>
              {p.description && (
                <div className="truncate text-xs text-muted-foreground">{p.description}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'category',
      header: t('category'),
      accessorFn: (row) => {
        const ids = row.categoryIds?.length ? row.categoryIds : [row.categoryId];
        return ids.map((id) => categoriesById[id]).filter(Boolean).join(', ') || '—';
      },
      filterFn: (row, _columnId, filterValue) => {
        const ids = row.original.categoryIds?.length
          ? row.original.categoryIds
          : [row.original.categoryId];
        return ids.includes(filterValue as string);
      },
      cell: ({ row }) => {
        const ids = row.original.categoryIds?.length
          ? row.original.categoryIds
          : [row.original.categoryId];
        const names = ids.map((id) => categoriesById[id]).filter(Boolean);
        return names.length ? (
          <div className="flex flex-wrap gap-1">
            {names.map((name, i) => (
              <AdminStatusBadge key={i} tone="neutral">
                {name}
              </AdminStatusBadge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: 'price',
      header: t('price'),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{formatPrice(row.original.price, locale)}</span>
      ),
    },
    {
      accessorKey: 'stock',
      header: t('stock'),
      cell: ({ row }) => {
        const stock = row.original.stock ?? 0;
        const tone = stock === 0 ? 'danger' : stock < 10 ? 'warning' : 'success';
        return (
          <AdminStatusBadge tone={tone} withDot>
            {stock} {stock === 1 ? t('unit') : t('units')}
          </AdminStatusBadge>
        );
      },
    },
    {
      accessorKey: 'isAvailable',
      header: t('availability'),
      filterFn: (row, _columnId, filterValue) =>
        String(row.original.isAvailable) === String(filterValue),
      cell: ({ row }) => (
        <AdminStatusBadge tone={row.original.isAvailable ? 'success' : 'neutral'} withDot>
          {row.original.isAvailable ? t('available') : t('unavailable')}
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
      cell: ProductsTableActions,
    },
  ];
}

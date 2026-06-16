'use client';

import type { OrderStatus } from '@/features/orders/data/order.types';

/** Palette alignée sur les tons des badges admin (emerald, sky, violet, amber, rose). */
export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: '#f59e0b', // amber-500
  preparing: '#0ea5e9', // sky-500
  ready: '#8b5cf6', // violet-500
  delivered: '#10b981', // emerald-500
  cancelled: '#f43f5e', // rose-500
};

export const CHART_COLORS = {
  revenue: '#10b981', // emerald-500
  products: '#0ea5e9', // sky-500
  categories: '#8b5cf6', // violet-500
};

export function formatCurrency(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatShortDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(
    new Date(iso),
  );
}

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

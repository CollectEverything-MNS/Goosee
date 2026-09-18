'use client';

import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, Clock, Loader2, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ORDER_STATUSES, Order, OrderStatus } from './data/order.types';
import { useListOrders } from './usecases/use-list-orders';
import { useUpdateOrderStatus } from './usecases/use-update-order-status';

function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function formatTime(value: string, locale: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function CounterCard({ order }: { order: Order }) {
  const t = useTranslations('admin.orders.counter');
  const tStatus = useTranslations('admin.orders.statusValues');
  const locale = useLocale();
  const updateStatus = useUpdateOrderStatus();
  const isPending = updateStatus.isPending && updateStatus.variables?.id === order.id;
  const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
  const customerName =
    `${order.customer.firstName} ${order.customer.lastName}`.trim() || order.customer.email;

  const handleDeliver = () => {
    updateStatus.mutate(
      { id: order.id, status: 'shipped' },
      {
        onSuccess: () => toast.success(t('delivered')),
        onError: () => toast.error(t('error')),
      }
    );
  };

  const handleStatusChange = (status: OrderStatus) => {
    if (status === order.status) return;
    updateStatus.mutate(
      { id: order.id, status },
      {
        onSuccess: () => toast.success(t('statusUpdated')),
        onError: () => toast.error(t('error')),
      }
    );
  };

  return (
    <Card className="flex flex-col border-none shadow-sm">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {order.reference}
            </p>
            <p className="truncate text-base font-semibold capitalize text-foreground">
              {customerName}
            </p>
            <p className="truncate text-sm text-muted-foreground">{order.customer.email}</p>
          </div>
          <span className="flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(order.createdAt, locale)}
          </span>
        </div>

        <div className="space-y-1.5 rounded-lg border bg-muted/30 px-3 py-2.5">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{item.quantity}×</span>{' '}
                {item.productName}
              </span>
              <span className="whitespace-nowrap">
                {formatPrice(item.unitPrice * item.quantity, locale)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('itemsCount', { count: itemsCount })}
          </span>
          <span className="text-lg font-bold">{formatPrice(order.total, locale)}</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{t('statusLabel')}</label>
          <Select
            value={order.status}
            onValueChange={(v) => handleStatusChange(v as OrderStatus)}
            disabled={isPending}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {tStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button size="lg" className="w-full gap-2" onClick={handleDeliver} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          {t('markDelivered')}
        </Button>
      </CardContent>
    </Card>
  );
}

export function Counter() {
  const t = useTranslations('admin.orders.counter');
  const { data: orders = [], isLoading } = useListOrders();
  // Commandes actives à remettre au client : tout sauf déjà livrées ou annulées.
  // (Changer le statut entre en attente/payée/préparée garde la carte visible ;
  // seul « livré » ou « annulée » la fait sortir de la caisse.)
  const toHandOver = orders.filter((o) => o.status !== 'shipped' && o.status !== 'cancelled');

  return (
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('title')}
        subtitle={t('subtitle', { count: toHandOver.length })}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : toHandOver.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <PackageCheck className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{t('emptyTitle')}</h3>
          <p className="max-w-sm text-sm text-muted-foreground">{t('emptyHint')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {toHandOver.map((order) => (
            <CounterCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

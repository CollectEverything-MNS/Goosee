'use client';

import { useLocale } from 'next-intl';
import { Package, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Order, OrderStatus } from '@/features/orders/data/order.types';
import { MY_ORDERS_MOCK } from '../data/my-orders.mock';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  preparing: 'En préparation',
  ready: 'Prête',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  preparing: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  ready: 'bg-violet-100 text-violet-700 hover:bg-violet-100',
  delivered: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
};

function formatDate(value: string, locale: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function OrderCard({ order, locale }: { order: Order; locale: string }) {
  const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{order.reference}</p>
              <p className="text-sm text-muted-foreground">{formatDate(order.createdAt, locale)}</p>
            </div>
          </div>
          <Badge className={STATUS_CLASSES[order.status]} variant="secondary">
            {STATUS_LABELS[order.status]}
          </Badge>
        </div>

        <div className="mt-4 space-y-1.5 border-t pt-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.quantity} × {item.productName}
              </span>
              <span>{formatPrice(item.unitPrice * item.quantity, locale)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">
            {itemsCount} article{itemsCount > 1 ? 's' : ''}
          </span>
          <span className="text-base font-semibold">{formatPrice(order.total, locale)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function MyOrders() {
  const locale = useLocale();
  const orders = MY_ORDERS_MOCK;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Package className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Aucune commande pour le moment</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Vos commandes apparaîtront ici dès votre premier achat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} locale={locale} />
      ))}
    </div>
  );
}

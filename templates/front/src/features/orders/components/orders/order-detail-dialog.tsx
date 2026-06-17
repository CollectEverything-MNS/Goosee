'use client';

import { Loader2, ShoppingBag } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { AdminStatusBadge, AdminStatusTone } from '@/components/layout/admin/components/admin-status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useOrder } from '../../context/orders-provider';
import { ORDER_STATUSES, OrderStatus } from '../../data/order.types';
import { useUpdateOrderStatus } from '../../usecases/use-update-order-status';

const STATUS_TONE: Record<OrderStatus, AdminStatusTone> = {
  pending: 'warning',
  paid: 'info',
  shipped: 'success',
  cancelled: 'danger',
};

function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

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

export function OrderDetailDialog() {
  const t = useTranslations('admin.orders');
  const tStatus = useTranslations('admin.orders.statusValues');
  const locale = useLocale();
  const { open, setOpen, currentRow, setCurrentRow } = useOrder();
  const updateStatus = useUpdateOrderStatus();

  const isOpen = open === 'detail' && !!currentRow;

  const handleStatusChange = (status: OrderStatus) => {
    if (!currentRow || status === currentRow.status) return;
    // Mise à jour optimiste de la ligne ouverte ; la liste est rafraîchie au succès.
    setCurrentRow({ ...currentRow, status });
    updateStatus.mutate(
      { id: currentRow.id, status },
      {
        onSuccess: () => toast.success(t('detail.statusUpdated')),
        onError: () => {
          toast.error(t('detail.statusUpdateError'));
          setCurrentRow((prev) => (prev ? { ...prev, status: currentRow.status } : prev));
        },
      }
    );
  };

  const handleClose = () => {
    setCurrentRow(null);
    setOpen(null);
  };

  if (!currentRow) {
    return (
      <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent />
      </Dialog>
    );
  }

  const order = currentRow;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        <DialogHeader className="space-y-3 border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-0.5 text-left">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                {order.reference}
                <AdminStatusBadge tone={STATUS_TONE[order.status]} withDot>
                  {tStatus(order.status)}
                </AdminStatusBadge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {formatDateTime(order.createdAt, locale)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('detail.customer')}
            </h3>
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
              <div className="font-medium text-foreground">
                {order.customer.firstName} {order.customer.lastName}
              </div>
              <div className="text-xs text-muted-foreground">{order.customer.email}</div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('detail.items')}
            </h3>
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('detail.product')}
                    </th>
                    <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('detail.quantity')}
                    </th>
                    <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('detail.unitPrice')}
                    </th>
                    <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('detail.subtotal')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-4 py-3 text-foreground">{item.productName}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatPrice(item.unitPrice, locale)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatPrice(item.unitPrice * item.quantity, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td colSpan={3} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('detail.total')}
                    </td>
                    <td className="px-4 py-3 text-right text-base font-semibold text-foreground">
                      {formatPrice(order.total, locale)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {order.notes && (
            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('detail.notes')}
              </h3>
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                {order.notes}
              </div>
            </section>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t('detail.statusLabel')}
            </span>
            <Select
              value={order.status}
              onValueChange={(v) => handleStatusChange(v as OrderStatus)}
              disabled={updateStatus.isPending}
            >
              <SelectTrigger className="h-9 w-44">
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
            {updateStatus.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t('detail.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

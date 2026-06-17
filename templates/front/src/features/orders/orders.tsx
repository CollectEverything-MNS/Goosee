'use client';

import { useTranslations } from 'next-intl';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { DataTable } from '@/components/data-table/data-table';

import OrdersProvider from './context/orders-provider';
import { OrderDetailDialog } from './components/orders/order-detail-dialog';
import { OrdersListingToolbar } from './components/orders/orders-listing-toolbar';
import { useOrdersColumns } from './components/orders/orders-columns';
import { useListOrders } from './usecases/use-list-orders';

function OrdersContent() {
  const t = useTranslations();
  const { data: orders = [] } = useListOrders();
  const columns = useOrdersColumns();

  return (
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.orders')}
        subtitle={t('admin.orders.count', { count: orders.length })}
      />
      <DataTable columns={columns} data={orders} Toolbar={OrdersListingToolbar} />
      <OrderDetailDialog />
    </div>
  );
}

export function Orders() {
  return (
    <OrdersProvider>
      <OrdersContent />
    </OrdersProvider>
  );
}

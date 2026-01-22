import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { SalesHistoryBreadcrumb } from '@/features/orders/components/sales-history/sales-history-breadcrumb';

export default function Page() {
  return (
    <AdminLayout breadcrumb={<SalesHistoryBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Historiques'} />
    </AdminLayout>
  )
}

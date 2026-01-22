import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { OrdersBreadcrumb } from '@/features/orders/components/orders/orders-breadcrumb';

export default function Page() {
  return (
    <AdminLayout breadcrumb={<OrdersBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Commandes'} />
    </AdminLayout>
  )
}

import { AdminTitle } from '@/components/layout/admin-title'
import { OrdersBreadcrumb } from '@/features/orders/components/orders/orders-breadcrumb'
import AdminLayout from '@/components/layout/layout'

export default function Page() {
  return (
    <AdminLayout breadcrumb={<OrdersBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Commandes'} />
    </AdminLayout>
  )
}

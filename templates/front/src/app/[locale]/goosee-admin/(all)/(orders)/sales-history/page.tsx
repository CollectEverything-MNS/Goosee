import { AdminTitle } from '@/components/layout/admin-title'
import { SalesHistoryBreadcrumb } from '@/features/orders/components/sales-history/sales-history-breadcrumb'
import AdminLayout from '@/components/layout/layout'

export default function Page() {
  return (
    <AdminLayout breadcrumb={<SalesHistoryBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Historiques'} />
    </AdminLayout>
  )
}

import AdminLayout from '@/components/layout/admin/components/layout';
import { Orders } from '@/features/orders/orders';

export default function Page() {
  return (
    <AdminLayout>
      <Orders />
    </AdminLayout>
  )
}

import AdminLayout from '@/components/layout/admin/components/layout';
import { Counter } from '@/features/orders/counter';

export default function Page() {
  return (
    <AdminLayout>
      <Counter />
    </AdminLayout>
  );
}

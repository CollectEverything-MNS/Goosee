import AdminLayout from '@/components/layout/admin/components/layout';
import { Products } from '@/features/products/products';

export default function Page() {
  return (
    <AdminLayout>
      <Products />
    </AdminLayout>
  );
}

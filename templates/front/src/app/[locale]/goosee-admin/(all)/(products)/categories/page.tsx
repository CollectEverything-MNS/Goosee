import AdminLayout from '@/components/layout/admin/components/layout';
import { Categories } from '@/features/products/categories';

export default function Page() {
  return (
    <AdminLayout>
      <Categories />
    </AdminLayout>
  );
}

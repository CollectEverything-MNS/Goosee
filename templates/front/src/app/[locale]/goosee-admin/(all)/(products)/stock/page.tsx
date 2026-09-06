import AdminLayout from '@/components/layout/admin/components/layout';
import { Stock } from '@/features/stock/stock';

export default function Page() {
  return (
    <AdminLayout>
      <Stock />
    </AdminLayout>
  );
}

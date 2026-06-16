import AdminLayout from '@/components/layout/admin/components/layout';
import { Menu } from '@/features/personnalisation/menu/menu';

export default function MenuPage() {
  return (
    <AdminLayout>
      <Menu />
    </AdminLayout>
  );
}

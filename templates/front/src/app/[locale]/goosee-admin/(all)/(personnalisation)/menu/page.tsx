import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { MenuBreadcrumb } from '@/features/personnalisation/menu/components/menu-breadcrumb';
import { Menu } from '@/features/personnalisation/menu/menu';

export default function MenuPage() {
  return (
    <AdminLayout breadcrumb={<MenuBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Menu'} />
      <Menu />
    </AdminLayout>
  );
}

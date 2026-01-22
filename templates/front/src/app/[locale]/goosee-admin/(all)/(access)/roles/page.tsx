import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { RolesBreadcrumb } from '@/features/access/components/roles/roles-breadcrumb';

export default function Page() {
  return (
    <AdminLayout breadcrumb={<RolesBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Rôles'} />
    </AdminLayout>
  )
}

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { UsersBreadcrumb } from '@/features/access/components/users/users-breadcrumb';
import { Users } from '@/features/users/users';

export default function Page() {
  return (
    <AdminLayout breadcrumb={<UsersBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Utilisateurs'} />
      <Users />
    </AdminLayout>
  )
}

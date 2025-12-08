import { AdminTitle } from '@/components/layout/admin-title'
import { UsersBreadcrumb } from '@/features/access/components/users/users-breadcrumb'
import AdminLayout from '@/components/layout/layout'

export default function Page() {
  return (
    <AdminLayout breadcrumb={<UsersBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Utilisateurs'} />
    </AdminLayout>
  )
}

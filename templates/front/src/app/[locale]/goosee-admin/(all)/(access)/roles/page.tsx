import { AdminTitle } from '@/components/layout/admin-title'
import { RolesBreadcrumb } from '@/features/access/components/roles/roles-breadcrumb'
import AdminLayout from '@/components/layout/layout'

export default function Page() {
  return (
    <AdminLayout breadcrumb={<RolesBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Rôles'} />
    </AdminLayout>
  )
}

import { AdminTitle } from '@/components/layout/admin-title'
import { ClientsBreadcrumb } from '@/features/clients/components/clients/clients-breadcrumb'
import AdminLayout from '@/components/layout/layout'

export default function Page() {
  return (
    <AdminLayout breadcrumb={<ClientsBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Clients'} />
    </AdminLayout>
  )
}

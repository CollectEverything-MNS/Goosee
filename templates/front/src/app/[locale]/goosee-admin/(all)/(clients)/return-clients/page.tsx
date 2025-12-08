import { AdminTitle } from '@/components/layout/admin-title'
import { ReturnClientsBreadcrumb } from '@/features/clients/components/return-clients/return-clients-breadcrumb'
import AdminLayout from '@/components/layout/layout'

export default function Page() {
  return (
    <AdminLayout breadcrumb={<ReturnClientsBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Retour clients'} />
    </AdminLayout>
  )
}

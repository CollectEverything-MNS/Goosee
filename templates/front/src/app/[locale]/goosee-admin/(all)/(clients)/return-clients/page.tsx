import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { ReturnClientsBreadcrumb } from '@/features/clients/return-clients/components/return-clients-breadcrumb';

export default function Page() {
  return (
    <AdminLayout breadcrumb={<ReturnClientsBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Retour clients'} />
    </AdminLayout>
  )
}

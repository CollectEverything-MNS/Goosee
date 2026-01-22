import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { Clients } from '@/features/clients/clients/clients';
import { ClientsBreadcrumb } from '@/features/clients/clients/components/clients-breadcrumb';

export default function Page() {
  return (
    <AdminLayout breadcrumb={<ClientsBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Clients'} />
      <Clients />
    </AdminLayout>
  )
}

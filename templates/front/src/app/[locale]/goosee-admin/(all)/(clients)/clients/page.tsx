import AdminLayout from '@/components/layout/admin/components/layout';
import { Clients } from '@/features/clients/clients/clients';

export default function Page() {
  return (
    <AdminLayout>
      <Clients />
    </AdminLayout>
  )
}

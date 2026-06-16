import AdminLayout from '@/components/layout/admin/components/layout';
import { Roles } from '@/features/roles/roles';

export default function Page() {
  return (
    <AdminLayout>
      <Roles />
    </AdminLayout>
  )
}

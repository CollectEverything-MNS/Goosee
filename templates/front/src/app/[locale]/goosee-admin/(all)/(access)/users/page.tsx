import AdminLayout from '@/components/layout/admin/components/layout';
import { Users } from '@/features/users/users';

export default function Page() {
  return (
    <AdminLayout>
      <Users />
    </AdminLayout>
  );
}

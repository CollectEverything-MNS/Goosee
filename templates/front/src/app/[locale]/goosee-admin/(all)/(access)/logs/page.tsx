import AdminLayout from '@/components/layout/admin/components/layout';
import { Logs } from '@/features/logs/logs';

export default function Page() {
  return (
    <AdminLayout>
      <Logs />
    </AdminLayout>
  );
}

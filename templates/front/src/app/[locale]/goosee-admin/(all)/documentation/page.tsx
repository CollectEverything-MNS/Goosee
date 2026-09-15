import AdminLayout from '@/components/layout/admin/components/layout';
import { Documentation } from '@/features/documentation/documentation';

export default function Page() {
  return (
    <AdminLayout>
      <Documentation />
    </AdminLayout>
  );
}

import AdminLayout from '@/components/layout/admin/components/layout';
import { Pages } from '@/features/personnalisation/pages/pages';

export default function Page() {
  return (
    <AdminLayout>
      <Pages />
    </AdminLayout>
  )
}

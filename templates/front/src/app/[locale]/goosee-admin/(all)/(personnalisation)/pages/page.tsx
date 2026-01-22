import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { PagesBreadcrumb } from '@/features/personnalisation/pages/components/pages-breadcrumb';
import { Pages } from '@/features/personnalisation/pages/pages';

export default function Page() {
  return (
    <AdminLayout breadcrumb={<PagesBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Pages'} />
      <Pages />
    </AdminLayout>
  )
}

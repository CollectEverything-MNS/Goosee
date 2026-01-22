import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import Layout from '@/components/layout/admin/components/layout';
import { DashboardBreadcrumb } from '@/features/dashboard/components/dashboard-breadcrumb';

export default function Page() {
  return (
    <Layout breadcrumb={<DashboardBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Tableau de bord'} />
    </Layout>
  )
}

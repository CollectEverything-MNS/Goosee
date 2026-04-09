import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import Layout from '@/components/layout/admin/components/layout';
import { DashboardBreadcrumb } from '@/features/dashboard/components/dashboard-breadcrumb';
import { Dashboard } from '@/features/dashboard/dashboard';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <Layout breadcrumb={<DashboardBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('dashboard')} />
      <Dashboard />
    </Layout>
  )
}

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { LogsBreadcrumb } from '@/features/access/components/logs/logs-breadcrumb';
import { Logs } from '@/features/logs/logs';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<LogsBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('logs')} />
      <Logs />
    </AdminLayout>
  );
}

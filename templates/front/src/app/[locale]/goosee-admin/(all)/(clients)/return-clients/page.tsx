import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout>
      <AdminTitle size={'h1'} title={t('returnClients')} />
    </AdminLayout>
  )
}

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { Templates } from '@/features/personnalisation/templates/templates';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout>
      <AdminTitle size={'h1'} title={t('templates')} />
      <Templates />
    </AdminLayout>
  );
}

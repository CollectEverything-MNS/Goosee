import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { PagesBreadcrumb } from '@/features/personnalisation/pages/components/pages-breadcrumb';
import { Pages } from '@/features/personnalisation/pages/pages';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<PagesBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('pages')} />
      <Pages />
    </AdminLayout>
  )
}

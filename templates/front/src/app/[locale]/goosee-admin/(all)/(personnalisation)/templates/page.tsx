import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { TemplatesBreadcrumb } from '@/features/personnalisation/templates/components/templates-breadcrumb';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<TemplatesBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('templates')} />
    </AdminLayout>
  )
}

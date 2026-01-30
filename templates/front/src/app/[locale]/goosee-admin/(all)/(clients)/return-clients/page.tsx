import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { ReturnClientsBreadcrumb } from '@/features/clients/return-clients/components/return-clients-breadcrumb';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<ReturnClientsBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('returnClients')} />
    </AdminLayout>
  )
}

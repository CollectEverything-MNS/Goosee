import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { Clients } from '@/features/clients/clients/clients';
import { ClientsBreadcrumb } from '@/features/clients/clients/components/clients-breadcrumb';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<ClientsBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('clients')} />
      <Clients />
    </AdminLayout>
  )
}

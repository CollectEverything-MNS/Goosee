import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { RolesBreadcrumb } from '@/features/access/components/roles/roles-breadcrumb';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<RolesBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('roles')} />
    </AdminLayout>
  )
}

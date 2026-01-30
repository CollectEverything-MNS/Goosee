import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { UsersBreadcrumb } from '@/features/access/components/users/users-breadcrumb';
import { Users } from '@/features/users/users';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<UsersBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('users')} />
      <Users />
    </AdminLayout>
  )
}

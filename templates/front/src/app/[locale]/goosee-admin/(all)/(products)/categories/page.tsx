import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { CategoriesBreadcrumb } from '@/features/products/components/categories/categories-breadcrumb';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<CategoriesBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('categories')} />
    </AdminLayout>
  )
}

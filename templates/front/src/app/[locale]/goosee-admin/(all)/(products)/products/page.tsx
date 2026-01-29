import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { ProductsBreadcrumb } from '@/features/products/components/products/products-breadcrumb';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<ProductsBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('products')} />
    </AdminLayout>
  )
}

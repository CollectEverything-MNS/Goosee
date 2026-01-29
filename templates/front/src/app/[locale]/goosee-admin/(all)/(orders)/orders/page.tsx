import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { OrdersBreadcrumb } from '@/features/orders/components/orders/orders-breadcrumb';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<OrdersBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('orders')} />
    </AdminLayout>
  )
}

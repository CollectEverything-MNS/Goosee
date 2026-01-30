import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { SalesHistoryBreadcrumb } from '@/features/orders/components/sales-history/sales-history-breadcrumb';
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<SalesHistoryBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('salesHistory')} />
    </AdminLayout>
  )
}

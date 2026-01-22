import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { ProductsBreadcrumb } from '@/features/products/components/products/products-breadcrumb';

export default function Page() {
  return (
    <AdminLayout breadcrumb={<ProductsBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Produits'} />
    </AdminLayout>
  )
}

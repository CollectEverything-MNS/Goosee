import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { CategoriesBreadcrumb } from '@/features/products/components/categories/categories-breadcrumb';

export default function Page() {
  return (
    <AdminLayout breadcrumb={<CategoriesBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Catégories'} />
    </AdminLayout>
  )
}

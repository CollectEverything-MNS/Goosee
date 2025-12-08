import { AdminTitle } from '@/components/layout/admin-title'
import { CategoriesBreadcrumb } from '@/features/products/components/categories/categories-breadcrumb'
import AdminLayout from '@/components/layout/layout'

export default function Page() {
  return (
    <AdminLayout breadcrumb={<CategoriesBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Catégories'} />
    </AdminLayout>
  )
}

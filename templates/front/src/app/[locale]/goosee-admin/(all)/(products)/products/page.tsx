import { AdminTitle } from '@/components/layout/admin-title'
import { ProductsBreadcrumb } from '@/features/products/components/products/products-breadcrumb'
import AdminLayout from '@/components/layout/layout'

export default function Page() {
  return (
    <AdminLayout breadcrumb={<ProductsBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Produits'} />
    </AdminLayout>
  )
}

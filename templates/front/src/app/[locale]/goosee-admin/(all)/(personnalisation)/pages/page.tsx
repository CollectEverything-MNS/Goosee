import { AdminTitle } from '@/components/layout/admin-title'
import { PagesBreadcrumb } from '@/features/personnalisation/pages/components/pages-breadcrumb'
import AdminLayout from '@/components/layout/layout'
import { Pages } from '@/features/personnalisation/pages/pages'

export default function Page() {
  return (
    <AdminLayout breadcrumb={<PagesBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Pages'} />
      <Pages />
    </AdminLayout>
  )
}

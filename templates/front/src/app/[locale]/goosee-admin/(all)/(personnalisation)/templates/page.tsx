import { AdminTitle } from '@/components/layout/admin-title'
import { TemplatesBreadcrumb } from '@/features/personnalisation/templates/components/templates-breadcrumb'
import AdminLayout from '@/components/layout/layout'

export default function Page() {
  return (
    <AdminLayout breadcrumb={<TemplatesBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Modèle de style'} />
    </AdminLayout>
  )
}

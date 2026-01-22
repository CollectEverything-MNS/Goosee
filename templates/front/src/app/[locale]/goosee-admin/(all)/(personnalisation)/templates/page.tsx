import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { TemplatesBreadcrumb } from '@/features/personnalisation/templates/components/templates-breadcrumb';

export default function Page() {
  return (
    <AdminLayout breadcrumb={<TemplatesBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Modèle de style'} />
    </AdminLayout>
  )
}

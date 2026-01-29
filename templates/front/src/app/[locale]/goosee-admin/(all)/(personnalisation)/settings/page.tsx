import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { SettingsBreadcrumb } from '@/features/personnalisation/settings/components/settings-breadcrumb';
import { Settings } from '@/features/personnalisation/settings/settings';

export default function SettingsPage() {
  return (
    <AdminLayout breadcrumb={<SettingsBreadcrumb />}>
      <AdminTitle size={'h1'} title={'Paramètres du site'} />
      <Settings />
    </AdminLayout>
  );
}

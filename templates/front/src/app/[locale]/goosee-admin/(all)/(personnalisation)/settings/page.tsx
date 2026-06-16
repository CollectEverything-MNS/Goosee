import AdminLayout from '@/components/layout/admin/components/layout';
import { Settings } from '@/features/personnalisation/settings/settings';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <Settings />
    </AdminLayout>
  );
}

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import AdminLayout from '@/components/layout/admin/components/layout';
import { SettingsBreadcrumb } from '@/features/personnalisation/settings/components/settings-breadcrumb';
import { Settings } from '@/features/personnalisation/settings/settings';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations('admin.pageTitles');
  return (
    <AdminLayout breadcrumb={<SettingsBreadcrumb />}>
      <AdminTitle size={'h1'} title={t('siteSettings')} />
      <Settings />
    </AdminLayout>
  );
}

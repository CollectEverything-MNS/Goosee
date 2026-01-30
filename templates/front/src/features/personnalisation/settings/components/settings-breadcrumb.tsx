'use client';

import { useTranslations } from 'next-intl';
import { AdminBreadcrumbGeneric } from '@/components/layout/admin/components/admin-breadcrumb-generic';

export function SettingsBreadcrumb() {
  const t = useTranslations();

  return (
    <AdminBreadcrumbGeneric items={[{ label: t('admin.siteSettings.title') }]} />
  );
}

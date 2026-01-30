'use client';

import { useTranslations } from 'next-intl';
import { AdminBreadcrumbGeneric } from '@/components/layout/admin/components/admin-breadcrumb-generic';

export function MenuBreadcrumb() {
  const t = useTranslations();

  return (
    <AdminBreadcrumbGeneric items={[{ label: t('admin.menu.title') }]} />
  );
}

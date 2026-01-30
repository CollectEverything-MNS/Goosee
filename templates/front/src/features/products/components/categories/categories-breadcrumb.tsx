'use client';

import { useTranslations } from 'next-intl';
import { AdminBreadcrumbGeneric } from '@/components/layout/admin/components/admin-breadcrumb-generic';

export function CategoriesBreadcrumb() {
  const t = useTranslations('admin.pageTitles');
  return <AdminBreadcrumbGeneric items={[{ label: t('categories') }]} />
}

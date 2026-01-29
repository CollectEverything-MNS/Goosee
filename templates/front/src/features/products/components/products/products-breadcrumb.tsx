'use client';

import { useTranslations } from 'next-intl';
import { AdminBreadcrumbGeneric } from '@/components/layout/admin/components/admin-breadcrumb-generic';

export function ProductsBreadcrumb() {
  const t = useTranslations('admin.pageTitles');
  return <AdminBreadcrumbGeneric items={[{ label: t('products') }]} />
}

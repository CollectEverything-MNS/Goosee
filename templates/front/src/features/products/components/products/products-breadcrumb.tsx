'use client';

import { AdminBreadcrumbGeneric } from '@/components/layout/admin/components/admin-breadcrumb-generic';

export function ProductsBreadcrumb() {
  return <AdminBreadcrumbGeneric items={[{ label: 'Produits' }]} />
}

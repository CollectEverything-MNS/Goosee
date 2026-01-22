'use client';

import { AdminBreadcrumbGeneric } from '@/components/layout/admin/components/admin-breadcrumb-generic';

export function OrdersBreadcrumb() {
  return <AdminBreadcrumbGeneric items={[{ label: 'Commandes' }]} />
}

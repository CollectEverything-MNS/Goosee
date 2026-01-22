'use client';

import { AdminBreadcrumbGeneric } from '@/components/layout/admin/components/admin-breadcrumb-generic';

export function DashboardBreadcrumb() {
  return <AdminBreadcrumbGeneric items={[{ label: 'Tableau de bord' }]} />
}

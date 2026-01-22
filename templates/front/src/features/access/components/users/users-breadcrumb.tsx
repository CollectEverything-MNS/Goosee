'use client';

import { AdminBreadcrumbGeneric } from '@/components/layout/admin/components/admin-breadcrumb-generic';

export function UsersBreadcrumb() {
  return <AdminBreadcrumbGeneric items={[{ label: 'Utilisateurs' }]} />
}

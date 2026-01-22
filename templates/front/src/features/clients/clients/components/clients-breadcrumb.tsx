'use client';

import { AdminBreadcrumbGeneric } from '@/components/layout/admin/components/admin-breadcrumb-generic';

export function ClientsBreadcrumb() {
  return <AdminBreadcrumbGeneric items={[{ label: 'Users' }, { label: 'Test' }]} />
}

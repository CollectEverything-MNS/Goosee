'use client'
import { AdminBreadcrumbGeneric } from '@/components/layout/admin-breadcrumb-generic'

export function PagesBreadcrumb() {
  return <AdminBreadcrumbGeneric items={[{ label: 'Pages' }, { label: 'Test' }]} />
}

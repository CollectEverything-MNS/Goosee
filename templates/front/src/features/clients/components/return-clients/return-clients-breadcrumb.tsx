'use client'
import { AdminBreadcrumbGeneric } from '@/components/layout/admin-breadcrumb-generic'

export function ReturnClientsBreadcrumb() {
  return <AdminBreadcrumbGeneric items={[{ label: 'Retour clients' }]} />
}

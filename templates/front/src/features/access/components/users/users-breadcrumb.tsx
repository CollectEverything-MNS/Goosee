'use client'
import { AdminBreadcrumbGeneric } from '@/components/layout/admin-breadcrumb-generic'

export function UsersBreadcrumb() {
  return <AdminBreadcrumbGeneric items={[{ label: 'Utilisateurs' }]} />
}

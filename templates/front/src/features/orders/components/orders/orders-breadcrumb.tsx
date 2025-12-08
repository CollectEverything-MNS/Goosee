'use client'
import { AdminBreadcrumbGeneric } from '@/components/layout/admin-breadcrumb-generic'

export function OrdersBreadcrumb() {
  return <AdminBreadcrumbGeneric items={[{ label: 'Commandes' }]} />
}

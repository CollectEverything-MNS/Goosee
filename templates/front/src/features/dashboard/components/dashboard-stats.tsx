'use client';

import { Users, Shield, FileText, UserCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDashboardStats } from '../usecases/use-dashboard-stats';
import { DashboardStatCard } from './dashboard-stat-card';

export function DashboardStats() {
  const t = useTranslations('admin.dashboard');
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        title={t('stats.admins')}
        value={data?.admins}
        icon={Users}
        loading={isLoading}
        color="bg-blue-500"
      />
      <DashboardStatCard
        title={t('stats.customers')}
        value={data?.customers}
        icon={UserCheck}
        loading={isLoading}
        color="bg-green-500"
      />
      <DashboardStatCard
        title={t('stats.roles')}
        value={data?.roles}
        icon={Shield}
        loading={isLoading}
        color="bg-purple-500"
      />
      <DashboardStatCard
        title={t('stats.logs')}
        value={data?.logs}
        icon={FileText}
        loading={isLoading}
        color="bg-orange-500"
      />
    </div>
  );
}

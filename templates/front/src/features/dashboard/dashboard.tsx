'use client';

import { useTranslations } from 'next-intl';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';

import { DashboardQuickLinks } from './components/dashboard-quick-links';
import { DashboardRecentLogs } from './components/dashboard-recent-logs';
import { DashboardStats } from './components/dashboard-stats';
import { useDashboardStats } from './usecases/use-dashboard-stats';

export function Dashboard() {
  const t = useTranslations();
  const stats = useDashboardStats();
  const totalProducts = stats.find((s) => s.key === 'products')?.value ?? 0;

  return (
    <div className="space-y-8">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.dashboard')}
        subtitle={t('admin.dashboard.subtitle', { count: totalProducts })}
      />
      <DashboardStats />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardRecentLogs />
        </div>
        <div>
          <DashboardQuickLinks />
        </div>
      </div>
    </div>
  );
}

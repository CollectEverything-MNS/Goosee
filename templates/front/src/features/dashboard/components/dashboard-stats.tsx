'use client';

import { Boxes, Package, ShieldCheck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useDashboardStats } from '../usecases/use-dashboard-stats';
import { DashboardStatCard } from './dashboard-stat-card';

type Accent = 'default' | 'success' | 'info' | 'accent';

const CONFIG: Record<string, { icon: typeof Users; accent: Accent }> = {
  admins: { icon: ShieldCheck, accent: 'accent' },
  customers: { icon: Users, accent: 'info' },
  products: { icon: Package, accent: 'success' },
  categories: { icon: Boxes, accent: 'default' },
};

export function DashboardStats() {
  const t = useTranslations('admin.dashboard.stats');
  const stats = useDashboardStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const cfg = CONFIG[stat.key];
        return (
          <DashboardStatCard
            key={stat.key}
            label={t(stat.key)}
            value={stat.value}
            icon={cfg.icon}
            accent={cfg.accent}
            isLoading={stat.isLoading}
          />
        );
      })}
    </div>
  );
}

'use client';

import { DashboardStats } from './components/dashboard-stats';
import { DashboardRecentLogs } from './components/dashboard-recent-logs';
import { DashboardQuickLinks } from './components/dashboard-quick-links';

export function Dashboard() {
  return (
    <div className="space-y-6">
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

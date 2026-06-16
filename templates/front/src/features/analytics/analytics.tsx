'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { AdminStatusBadge } from '@/components/layout/admin/components/admin-status-badge';
import { AdminTitle } from '@/components/layout/admin/components/admin-title';

import { AnalyticsCategoryChart } from './components/analytics-category-chart';
import { AnalyticsFilters } from './components/analytics-filters';
import { AnalyticsKpiRow } from './components/analytics-kpis';
import { AnalyticsRevenueChart } from './components/analytics-revenue-chart';
import { AnalyticsStatusChart } from './components/analytics-status-chart';
import { AnalyticsTopProducts } from './components/analytics-top-products';
import {
  AnalyticsPeriod,
  DateRange,
  resolvePeriodRange,
} from './data/period';
import { useAnalytics } from './usecases/use-analytics';

export function Analytics() {
  const t = useTranslations('admin.analytics');
  const [period, setPeriod] = useState<AnalyticsPeriod>('all');
  const [customRange, setCustomRange] = useState<DateRange>({});

  const range = useMemo(
    () => resolvePeriodRange(period, customRange),
    [period, customRange],
  );
  const analytics = useAnalytics(range);

  return (
    <div className="space-y-8">
      <AdminTitle
        size="h1"
        title={t('title')}
        subtitle={t('subtitle')}
        actions={<AdminStatusBadge tone="neutral">{t('note')}</AdminStatusBadge>}
      />

      <AnalyticsFilters
        period={period}
        onPeriodChange={setPeriod}
        range={range}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
      />

      <AnalyticsKpiRow kpis={analytics.kpis} isLoading={analytics.isLoading} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsRevenueChart data={analytics.revenueByDay} />
        </div>
        <div>
          <AnalyticsStatusChart data={analytics.ordersByStatus} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsTopProducts data={analytics.topProducts} />
        <AnalyticsCategoryChart data={analytics.productsByCategory} />
      </div>
    </div>
  );
}

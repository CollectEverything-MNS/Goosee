'use client';

import { Receipt, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { AnalyticsKpis } from '../usecases/use-analytics';
import { AnalyticsKpiCard } from './analytics-kpi-card';
import { formatCurrency } from './analytics-shared';

interface Props {
  kpis: AnalyticsKpis;
  isLoading: boolean;
}

export function AnalyticsKpiRow({ kpis, isLoading }: Props) {
  const t = useTranslations('admin.analytics.kpis');
  const locale = useLocale();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <AnalyticsKpiCard
        label={t('revenue')}
        value={formatCurrency(kpis.revenue, locale)}
        icon={TrendingUp}
        accent="success"
        hint={t('itemsSold', { count: kpis.itemsSold })}
        isLoading={isLoading}
      />
      <AnalyticsKpiCard
        label={t('orders')}
        value={kpis.orders.toLocaleString(locale)}
        icon={ShoppingBag}
        accent="info"
        hint={t('cancellationRate', { rate: kpis.cancellationRate })}
        isLoading={isLoading}
      />
      <AnalyticsKpiCard
        label={t('avgBasket')}
        value={formatCurrency(kpis.avgBasket, locale)}
        icon={Receipt}
        accent="accent"
        isLoading={isLoading}
      />
      <AnalyticsKpiCard
        label={t('customers')}
        value={kpis.customers.toLocaleString(locale)}
        icon={Users}
        accent="default"
        isLoading={isLoading}
      />
    </div>
  );
}

'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TopProduct } from '../usecases/use-analytics';
import {
  CHART_COLORS,
  ChartCard,
  ChartEmpty,
  formatCurrency,
} from './analytics-shared';

interface Props {
  data: TopProduct[];
}

export function AnalyticsTopProducts({ data }: Props) {
  const t = useTranslations('admin.analytics.charts');
  const locale = useLocale();

  return (
    <ChartCard title={t('topProducts')} description={t('topProductsDesc')}>
      {data.length === 0 ? (
        <ChartEmpty label={t('empty')} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-border"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-muted-foreground"
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-muted-foreground"
              width={120}
            />
            <Tooltip
              cursor={{ fill: 'currentColor', fillOpacity: 0.05 }}
              formatter={(value: number, _name: string, item: { payload?: TopProduct }) => [
                `${value} · ${formatCurrency(item.payload?.revenue ?? 0, locale)}`,
                t('topProductsTooltip'),
              ]}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid hsl(var(--border))',
                fontSize: 12,
              }}
            />
            <Bar dataKey="quantity" fill={CHART_COLORS.products} radius={[0, 6, 6, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

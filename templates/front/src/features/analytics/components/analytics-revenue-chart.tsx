'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { RevenuePoint } from '../usecases/use-analytics';
import {
  CHART_COLORS,
  ChartCard,
  ChartEmpty,
  formatCurrency,
  formatShortDate,
} from './analytics-shared';

interface Props {
  data: RevenuePoint[];
}

export function AnalyticsRevenueChart({ data }: Props) {
  const t = useTranslations('admin.analytics.charts');
  const locale = useLocale();

  const chartData = data.map((d) => ({
    ...d,
    label: formatShortDate(d.date, locale),
  }));

  return (
    <ChartCard title={t('revenue')} description={t('revenueDesc')}>
      {chartData.length === 0 ? (
        <ChartEmpty label={t('empty')} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.revenue} stopOpacity={0.3} />
                <stop offset="100%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-muted-foreground"
              width={56}
              tickFormatter={(v: number) => formatCurrency(v, locale)}
            />
            <Tooltip
              cursor={{ stroke: CHART_COLORS.revenue, strokeOpacity: 0.2 }}
              formatter={(value: number) => [formatCurrency(value, locale), t('revenue')]}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid hsl(var(--border))',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.revenue}
              strokeWidth={2}
              fill="url(#revenueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

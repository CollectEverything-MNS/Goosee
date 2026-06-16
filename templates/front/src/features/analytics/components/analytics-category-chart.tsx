'use client';

import { useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { CategorySlice } from '../usecases/use-analytics';
import { CHART_COLORS, ChartCard, ChartEmpty } from './analytics-shared';

interface Props {
  data: CategorySlice[];
}

export function AnalyticsCategoryChart({ data }: Props) {
  const t = useTranslations('admin.analytics.charts');

  return (
    <ChartCard title={t('categories')} description={t('categoriesDesc')}>
      {data.length === 0 ? (
        <ChartEmpty label={t('empty')} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-border"
              vertical={false}
            />
            <XAxis
              dataKey="name"
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
              width={40}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'currentColor', fillOpacity: 0.05 }}
              formatter={(value: number) => [value, t('categoriesTooltip')]}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid hsl(var(--border))',
                fontSize: 12,
              }}
            />
            <Bar dataKey="products" fill={CHART_COLORS.categories} radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

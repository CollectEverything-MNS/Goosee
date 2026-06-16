'use client';

import { useTranslations } from 'next-intl';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import type { StatusSlice } from '../usecases/use-analytics';
import { ChartCard, ChartEmpty, STATUS_COLOR } from './analytics-shared';

interface Props {
  data: StatusSlice[];
}

export function AnalyticsStatusChart({ data }: Props) {
  const t = useTranslations('admin.analytics.charts');
  const tStatus = useTranslations('admin.orders.statusValues');

  const total = data.reduce((sum, s) => sum + s.count, 0);
  const chartData = data.map((s) => ({
    ...s,
    label: tStatus(s.status),
    color: STATUS_COLOR[s.status],
  }));

  return (
    <ChartCard title={t('status')} description={t('statusDesc')}>
      {total === 0 ? (
        <ChartEmpty label={t('empty')} />
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <ResponsiveContainer width="100%" height={200} className="max-w-[200px]">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                strokeWidth={0}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid hsl(var(--border))',
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="w-full space-y-2 sm:flex-1">
            {chartData.map((entry) => (
              <li key={entry.status} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.label}
                </span>
                <span className="font-medium text-muted-foreground">
                  {entry.count} ({Math.round((entry.count / total) * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}

'use client';

import { CalendarDays } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { DateRange as DayPickerRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  ANALYTICS_PERIODS,
  AnalyticsPeriod,
  DateRange,
  latestOrderDate,
} from '../data/period';

interface Props {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  /** Plage effective appliquée (presets résolus inclus), pour affichage. */
  range: DateRange;
  customRange: DateRange;
  onCustomRangeChange: (range: DateRange) => void;
}

export function AnalyticsFilters({
  period,
  onPeriodChange,
  range,
  customRange,
  onCustomRangeChange,
}: Props) {
  const t = useTranslations('admin.analytics.filters');
  const locale = useLocale();

  const fmt = (d?: Date) =>
    d
      ? new Intl.DateTimeFormat(locale, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(d)
      : '';

  const rangeLabel =
    range.from && range.to ? `${fmt(range.from)} – ${fmt(range.to)}` : t('pickDates');

  const handleSelect = (selected: DayPickerRange | undefined) => {
    onCustomRangeChange({ from: selected?.from, to: selected?.to });
    if (selected?.from) onPeriodChange('custom');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={period} onValueChange={(v) => onPeriodChange(v as AnalyticsPeriod)}>
        <SelectTrigger className="w-[200px]" aria-label={t('period')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ANALYTICS_PERIODS.map((p) => (
            <SelectItem key={p} value={p}>
              {t(`periods.${p}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            {rangeLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={{ from: customRange.from, to: customRange.to }}
            onSelect={handleSelect}
            defaultMonth={customRange.from ?? range.from ?? latestOrderDate()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

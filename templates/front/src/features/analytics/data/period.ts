export type AnalyticsPeriod = 'all' | 'last7' | 'last30' | 'month' | 'custom';

export const ANALYTICS_PERIODS: AnalyticsPeriod[] = [
  'all',
  'last7',
  'last30',
  'month',
  'custom',
];

export interface DateRange {
  from?: Date;
  to?: Date;
}

const DAY_MS = 86_400_000;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/**
 * Les périodes relatives (7/30 jours, mois en cours) sont ancrées sur aujourd'hui :
 * les commandes provenant désormais de order-service, la date de référence est
 * naturellement le présent.
 */
export function latestOrderDate(): Date {
  return new Date();
}

export function resolvePeriodRange(
  period: AnalyticsPeriod,
  custom?: DateRange,
): DateRange {
  if (period === 'all') return {};

  if (period === 'custom') {
    return {
      from: custom?.from ? startOfDay(custom.from) : undefined,
      to: custom?.to ? endOfDay(custom.to) : undefined,
    };
  }

  const ref = latestOrderDate();
  const to = endOfDay(ref);

  if (period === 'month') {
    return { from: startOfDay(new Date(ref.getFullYear(), ref.getMonth(), 1)), to };
  }

  const days = period === 'last7' ? 7 : 30;
  return { from: startOfDay(new Date(ref.getTime() - (days - 1) * DAY_MS)), to };
}

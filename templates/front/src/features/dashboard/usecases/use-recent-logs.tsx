'use client';

import { useListLogs } from '@/features/logs/usecases/use-list-logs';
import type { Log } from '@/features/logs/data/log.types';

export function useRecentLogs(limit = 5): { logs: Log[]; isLoading: boolean } {
  const { data, isLoading } = useListLogs();

  const sorted = (data ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return { logs: sorted, isLoading };
}

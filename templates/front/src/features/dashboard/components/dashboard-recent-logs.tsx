'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import { AdminStatusBadge, AdminStatusTone } from '@/components/layout/admin/components/admin-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { routes } from '@/config/routes.config';
import type { LogLevel } from '@/features/logs/data/log.types';

import { useRecentLogs } from '../usecases/use-recent-logs';

const LEVEL_TONE: Record<LogLevel, AdminStatusTone> = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'danger',
  CRITICAL: 'danger',
  DEBUG: 'neutral',
};

function formatTime(iso: string, locale: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(date);
}

export function DashboardRecentLogs() {
  const t = useTranslations('admin.dashboard.recentLogs');
  const locale = useLocale();
  const { logs, isLoading } = useRecentLogs(5);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">{t('title')}</h3>
        <Link
          href={routes.gooseeAdmin.logs.getHref(locale)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {t('viewAll')}
        </Link>
      </div>
      <div className="divide-y divide-border/60">
        {isLoading && (
          <>
            <div className="p-5">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="p-5">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="p-5">
              <Skeleton className="h-10 w-full" />
            </div>
          </>
        )}
        {!isLoading && logs.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">{t('empty')}</p>
        )}
        {!isLoading &&
          logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-3 px-5 py-4">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  {log.level && (
                    <AdminStatusBadge tone={LEVEL_TONE[log.level]} withDot>
                      {log.level}
                    </AdminStatusBadge>
                  )}
                  {log.service && (
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {log.service}
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-foreground">{log.message}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatTime(log.createdAt, locale)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRecentLogs } from '../usecases/use-recent-logs';

const LEVEL_BADGE: Record<string, string> = {
  INFO: 'bg-blue-100 text-blue-800 border-blue-200',
  SUCCESS: 'bg-green-100 text-green-800 border-green-200',
  WARNING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ERROR: 'bg-red-100 text-red-800 border-red-200',
  CRITICAL: 'bg-purple-100 text-purple-800 border-purple-200',
  DEBUG: 'bg-gray-100 text-gray-800 border-gray-200',
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('fr-FR');
  } catch {
    return iso;
  }
};

export function DashboardRecentLogs() {
  const t = useTranslations('admin.dashboard');
  const tLevels = useTranslations('admin.logs.levels');
  const { data: logs = [], isLoading } = useRecentLogs(5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('recentLogs')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noLogs')}</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-md border p-3"
              >
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {log.level && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${LEVEL_BADGE[log.level] ?? ''}`}
                      >
                        {tLevels(log.level)}
                      </Badge>
                    )}
                    {log.service && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.service}
                      </span>
                    )}
                  </div>
                  <p className="text-sm truncate">{log.message}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(log.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

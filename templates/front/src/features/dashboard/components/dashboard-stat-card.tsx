'use client';

import { LucideIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  isLoading?: boolean;
  accent?: 'default' | 'success' | 'info' | 'accent';
}

const ACCENT: Record<NonNullable<Props['accent']>, string> = {
  default: 'bg-foreground/5 text-foreground',
  success: 'bg-emerald-50 text-emerald-700',
  info: 'bg-sky-50 text-sky-700',
  accent: 'bg-violet-50 text-violet-700',
};

export function DashboardStatCard({ label, value, icon: Icon, isLoading, accent = 'default' }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-9 w-20" />
          ) : (
            <div className="text-3xl font-semibold tracking-tight text-foreground">
              {value.toLocaleString()}
            </div>
          )}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', ACCENT[accent])}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}

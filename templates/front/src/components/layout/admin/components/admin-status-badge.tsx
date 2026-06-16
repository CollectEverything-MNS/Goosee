import { cn } from '@/lib/utils';

export type AdminStatusTone =
  | 'success'
  | 'neutral'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent';

const TONE: Record<AdminStatusTone, { dot: string; bg: string; text: string }> = {
  success: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  neutral: {
    dot: 'bg-zinc-400',
    bg: 'bg-zinc-100',
    text: 'text-zinc-700',
  },
  warning: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  danger: {
    dot: 'bg-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
  },
  info: {
    dot: 'bg-sky-500',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
  },
  accent: {
    dot: 'bg-violet-500',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
  },
};

interface Props {
  tone?: AdminStatusTone;
  children: React.ReactNode;
  withDot?: boolean;
  className?: string;
}

export function AdminStatusBadge({
  tone = 'neutral',
  children,
  withDot = false,
  className,
}: Props) {
  const styles = TONE[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles.bg,
        styles.text,
        className
      )}
    >
      {withDot && <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />}
      {children}
    </span>
  );
}

import { cn } from '@/lib/utils';

interface Props {
  firstName?: string;
  lastName?: string;
  email?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PALETTE = [
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-cyan-100 text-cyan-700',
  'bg-lime-100 text-lime-700',
];

function pickColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

const SIZE = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
} as const;

export function AdminAvatar({
  firstName,
  lastName,
  email,
  src,
  size = 'md',
  className,
}: Props) {
  const seed = (email || `${firstName}${lastName}`).toLowerCase();
  const initials = (
    `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() ||
    email?.slice(0, 2).toUpperCase() ||
    '??'
  );

  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className={cn('rounded-full object-cover ring-1 ring-border', SIZE[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZE[size],
        pickColor(seed),
        className
      )}
    >
      {initials}
    </div>
  );
}

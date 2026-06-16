import React from 'react';

import { cn } from '@/lib/utils';

interface Props {
  size: 'h1' | 'h2' | 'h3';
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminTitle({ size, title, subtitle, actions }: Props) {
  const Tag = size;
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <Tag
          className={cn('font-semibold tracking-tight text-foreground', {
            'text-3xl lg:text-4xl': size === 'h1',
            'text-2xl': size === 'h2',
            'text-xl': size === 'h3',
          })}
        >
          {title}
        </Tag>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

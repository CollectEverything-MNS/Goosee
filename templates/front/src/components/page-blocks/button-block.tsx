'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BlockPropsWithContext, ButtonBlockProps } from './types';

const ALIGNMENT_CLASSES = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const SIZE_MAP = {
  sm: 'sm' as const,
  md: 'default' as const,
  lg: 'lg' as const,
};

export function ButtonBlock({
  text,
  link,
  variant = 'primary',
  size = 'md',
  alignment = 'left',
  context,
}: BlockPropsWithContext<ButtonBlockProps>) {
  const isPreview = context?.mode === 'preview';

  const buttonVariant = variant === 'primary' ? 'default' : variant === 'secondary' ? 'secondary' : 'outline';

  return (
    <div
      className={cn(
        'flex px-4 py-4 md:px-8',
        ALIGNMENT_CLASSES[alignment],
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={context?.onSelect}
    >
      {isPreview ? (
        <Button variant={buttonVariant} size={SIZE_MAP[size]} className="pointer-events-none">
          {text || 'Bouton'}
        </Button>
      ) : (
        <Button variant={buttonVariant} size={SIZE_MAP[size]} asChild>
          <a href={link || '#'}>{text || 'Bouton'}</a>
        </Button>
      )}
    </div>
  );
}

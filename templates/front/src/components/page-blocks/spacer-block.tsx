'use client';

import { cn } from '@/lib/utils';
import { BlockPropsWithContext, SpacerBlockProps } from './types';

const HEIGHT_CLASSES = {
  sm: 'h-8',
  md: 'h-16',
  lg: 'h-24',
  xl: 'h-32',
};

export function SpacerBlock({
  height = 'md',
  context,
}: BlockPropsWithContext<SpacerBlockProps>) {
  const isPreview = context?.mode === 'preview';

  return (
    <div
      className={cn(
        HEIGHT_CLASSES[height],
        'w-full',
        isPreview && 'border-y border-dashed border-muted-foreground/30',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={context?.onSelect}
    >
      {isPreview && (
        <div className="flex h-full items-center justify-center"/>
      )}
    </div>
  );
}

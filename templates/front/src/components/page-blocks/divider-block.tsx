'use client';

import { cn } from '@/lib/utils';
import { BlockPropsWithContext, DividerBlockProps } from './types';

const WIDTH_CLASSES = {
  sm: 'max-w-xs',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  full: 'max-w-full',
};

const STYLE_CLASSES = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

export function DividerBlock({
  style = 'solid',
  color,
  width = 'full',
  context,
}: BlockPropsWithContext<DividerBlockProps>) {
  return (
    <div
      className={cn(
        'px-4 py-4 md:px-8',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={context?.onSelect}
    >
      <hr
        className={cn(
          'mx-auto border-t-2',
          WIDTH_CLASSES[width],
          STYLE_CLASSES[style],
          !color && 'border-border'
        )}
        style={color ? { borderColor: color } : undefined}
      />
    </div>
  );
}

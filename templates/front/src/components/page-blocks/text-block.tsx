'use client';

import { cn } from '@/lib/utils';
import { TextBlockProps, BlockPropsWithContext } from './types';

const ALIGNMENT_CLASSES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

interface ExtendedTextBlockProps extends TextBlockProps {
  color?: string;
}

export function TextBlock({
  content,
  alignment = 'left',
  color,
  context,
}: BlockPropsWithContext<ExtendedTextBlockProps>) {
  return (
    <div
      className={cn(
        'px-4 py-4 md:px-8',
        ALIGNMENT_CLASSES[alignment],
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={context?.onSelect}
    >
      <div
        className={cn('prose prose-sm md:prose-base max-w-none', !color && 'text-muted-foreground')}
        style={color ? { color } : undefined}
        dangerouslySetInnerHTML={{ __html: content || 'Votre texte ici...' }}
      />
    </div>
  );
}

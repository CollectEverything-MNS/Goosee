'use client';

import { cn } from '@/lib/utils';
import { BlockPropsWithContext, QuoteBlockProps } from './types';
import { Quote } from 'lucide-react';

const ALIGNMENT_CLASSES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function QuoteBlock({
  content,
  author,
  alignment = 'left',
  color,
  context,
}: BlockPropsWithContext<QuoteBlockProps>) {
  return (
    <blockquote
      className={cn(
        'px-4 py-6 md:px-8',
        ALIGNMENT_CLASSES[alignment],
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={context?.onSelect}
    >
      <div className={cn('relative mx-auto max-w-2xl', alignment === 'center' && 'text-center')}>
        <Quote
          className={cn(
            'absolute -top-2 -left-2 h-8 w-8 opacity-20',
            alignment === 'center' && 'left-1/2 -translate-x-1/2'
          )}
          style={color ? { color } : undefined}
        />
        <p
          className={cn('text-lg italic md:text-xl', !color && 'text-foreground')}
          style={color ? { color } : undefined}
        >
          &ldquo;{content || 'Votre citation ici...'}&rdquo;
        </p>
        {author && (
          <footer className="mt-3 text-sm text-muted-foreground">
            — {author}
          </footer>
        )}
      </div>
    </blockquote>
  );
}

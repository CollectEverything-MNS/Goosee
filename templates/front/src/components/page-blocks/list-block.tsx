'use client';

import { cn } from '@/lib/utils';
import { BlockPropsWithContext, ListBlockProps } from './types';
import { Check } from 'lucide-react';

const ALIGNMENT_CLASSES = {
  left: 'text-left',
  center: 'text-center mx-auto',
  right: 'text-right ml-auto',
};

export function ListBlock({
  items,
  style = 'bullet',
  alignment = 'left',
  color,
  context,
}: BlockPropsWithContext<ListBlockProps>) {
  const itemList = (items || 'Élément 1\nÉlément 2\nÉlément 3')
    .split('\n')
    .filter((item) => item.trim() !== '');

  const ListTag = style === 'number' ? 'ol' : 'ul';

  return (
    <div
      className={cn(
        'px-4 py-4 md:px-8',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={context?.onSelect}
    >
      <ListTag
        className={cn(
          'max-w-xl space-y-2',
          ALIGNMENT_CLASSES[alignment],
          style === 'number' && 'list-decimal list-inside',
          style === 'bullet' && 'list-disc list-inside',
          !color && 'text-foreground'
        )}
        style={color ? { color } : undefined}
      >
        {itemList.map((item, index) => (
          <li key={index} className={cn('flex items-start gap-2', style !== 'check' && 'list-item')}>
            {style === 'check' && (
              <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
            )}
            <span className={style === 'check' ? '' : undefined}>{item}</span>
          </li>
        ))}
      </ListTag>
    </div>
  );
}

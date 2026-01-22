'use client';

import { cn } from '@/lib/utils';
import { ImageBlockProps, BlockPropsWithContext } from './types';
import { ImageIcon } from 'lucide-react';

const WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  full: 'max-w-full',
};

const ALIGNMENT_CLASSES = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
};

export function ImageBlock({
  src,
  alt,
  caption,
  width = 'full',
  alignment = 'center',
  rounded = false,
  context,
}: BlockPropsWithContext<ImageBlockProps>) {
  const hasImage = src && src.trim() !== '';

  return (
    <figure
      className={cn(
        'px-4 py-4 md:px-8',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={context?.onSelect}
    >
      <div
        className={cn(
          WIDTH_CLASSES[width],
          ALIGNMENT_CLASSES[alignment],
          'overflow-hidden',
          rounded && 'rounded-lg'
        )}
      >
        {hasImage ? (
          <img
            src={src}
            alt={alt || 'Image'}
            className={cn('h-auto w-full object-cover', rounded && 'rounded-lg')}
          />
        ) : (
          <div
            className={cn(
              'flex aspect-video items-center justify-center bg-muted',
              rounded && 'rounded-lg'
            )}
          >
            <div className="text-center text-muted-foreground">
              <ImageIcon className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2 text-sm">Aucune image</p>
            </div>
          </div>
        )}
      </div>
      {caption && (
        <figcaption
          className={cn(
            'mt-2 text-sm text-muted-foreground',
            WIDTH_CLASSES[width],
            ALIGNMENT_CLASSES[alignment],
            alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left'
          )}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

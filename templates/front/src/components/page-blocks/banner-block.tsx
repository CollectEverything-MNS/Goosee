'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BlockPropsWithContext, BannerBlockProps } from './types';

const ALIGNMENT_CLASSES = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

export function BannerBlock({
  title,
  subtitle,
  buttonText,
  buttonLink,
  backgroundColor = '#dc2626',
  textColor = '#ffffff',
  alignment = 'center',
  context,
}: BlockPropsWithContext<BannerBlockProps>) {
  return (
    <section
      className={cn(
        'w-full px-6 py-10 md:px-12 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className={cn('mx-auto flex max-w-4xl flex-col gap-4', ALIGNMENT_CLASSES[alignment])}>
        {title && (
          <h2 className="text-xl font-bold sm:text-2xl md:text-3xl" style={{ color: textColor }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-lg opacity-90" style={{ color: textColor }}>
            {subtitle}
          </p>
        )}
        {buttonText && (
          <Button
            size="lg"
            variant="secondary"
            className="block-button mt-2"
            asChild={context?.mode !== 'preview'}
          >
            {context?.mode === 'preview' ? (
              <span>{buttonText}</span>
            ) : (
              <a href={buttonLink || '#'}>{buttonText}</a>
            )}
          </Button>
        )}
      </div>
    </section>
  );
}

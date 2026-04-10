'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BlockPropsWithContext, HeroBlockProps } from './types';

const HEIGHT_CLASSES = {
  sm: 'min-h-[250px]',
  md: 'min-h-[350px]',
  lg: 'min-h-[450px]',
  xl: 'min-h-[550px]',
  full: 'min-h-[calc(100vh-100px)]',
};

const ALIGNMENT_CLASSES = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

interface ExtendedHeroBlockProps extends HeroBlockProps {
  backgroundType?: 'color' | 'image' | 'gradient';
  backgroundColor?: string;
  textColor?: string;
}

export function HeroBlock({
  title,
  subtitle,
  buttonText,
  buttonLink,
  backgroundImage,
  alignment = 'center',
  overlay = true,
  height = 'lg',
  backgroundType = 'color',
  backgroundColor = '#3b82f6',
  textColor = '#ffffff',
  context,
}: BlockPropsWithContext<ExtendedHeroBlockProps>) {
  const isPreview = context?.mode === 'preview';
  const hasBackgroundImage = backgroundType === 'image' && backgroundImage && backgroundImage.trim() !== '';

  // Déterminer le style de fond
  const getBackgroundStyle = () => {
    if (hasBackgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    if (backgroundType === 'color' && backgroundColor) {
      return {
        backgroundColor,
      };
    }
    return {};
  };

  const hasCustomBackground = backgroundType !== 'color' || backgroundColor;

  return (
    <section
      className={cn(
        'relative flex w-full flex-col justify-center px-6 py-12 md:px-12 lg:px-20',
        HEIGHT_CLASSES[height],
        ALIGNMENT_CLASSES[alignment],
        !hasCustomBackground && 'bg-gradient-to-br from-primary/10 via-primary/5 to-background',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={getBackgroundStyle()}
      onClick={context?.onSelect}
    >
      {hasBackgroundImage && overlay && <div className="absolute inset-0 bg-black/50" />}

      <div
        className={cn(
          'relative z-10 max-w-3xl px-4',
          alignment === 'center' && 'mx-auto'
        )}
      >
        <h1
          className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
          style={{ color: textColor || '#ffffff' }}
        >
          {title || 'Votre titre principal'}
        </h1>

        {subtitle && (
          <p
            className="mt-4 text-base md:text-lg lg:text-xl opacity-90"
            style={{ color: textColor || '#ffffff' }}
          >
            {subtitle}
          </p>
        )}

        {buttonText && (
          <div className="mt-6">
            {isPreview ? (
              <Button size="lg" className="pointer-events-none">
                {buttonText}
              </Button>
            ) : (
              <Button size="lg" asChild>
                <a href={buttonLink || '#'}>{buttonText}</a>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

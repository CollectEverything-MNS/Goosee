'use client';

import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSiteTemplate } from '@/hooks/use-site-template';

import { BlockPropsWithContext, HeroBlockProps } from './types';

const HEIGHT_CLASSES = {
  sm: 'min-h-[260px]',
  md: 'min-h-[360px]',
  lg: 'min-h-[460px]',
  xl: 'min-h-[560px]',
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

export function HeroBlock(props: BlockPropsWithContext<ExtendedHeroBlockProps>) {
  const template = useSiteTemplate();

  if (template === 'restaurant') return <RestaurantHero {...props} />;
  if (template === 'bakery') return <BakeryHero {...props} />;
  if (template === 'beauty') return <BeautyHero {...props} />;
  if (template === 'drive') return <DriveHero {...props} />;
  return <DefaultHero {...props} />;
}

/* ----- DEFAULT — version d'origine ----- */
function DefaultHero({
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
  const hasBackgroundImage =
    backgroundType === 'image' && backgroundImage && backgroundImage.trim() !== '';

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
      return { backgroundColor };
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
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={getBackgroundStyle()}
      onClick={context?.onSelect}
    >
      {hasBackgroundImage && overlay && <div className="absolute inset-0 bg-black/50" />}
      <div className={cn('relative z-10 max-w-3xl px-4', alignment === 'center' && 'mx-auto')}>
        <h1
          className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
          style={{ color: textColor || '#ffffff' }}
        >
          {title || 'Votre titre principal'}
        </h1>
        {subtitle && (
          <p
            className="mt-4 text-base opacity-90 md:text-lg lg:text-xl"
            style={{ color: textColor || '#ffffff' }}
          >
            {subtitle}
          </p>
        )}
        {buttonText && (
          <div className="mt-6">
            {isPreview ? (
              <Button size="lg" className="block-button pointer-events-none">
                {buttonText}
              </Button>
            ) : (
              <Button size="lg" asChild className="block-button">
                <a href={buttonLink || '#'}>{buttonText}</a>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ----- DRIVE — Split horizontal, image à droite, vibe efficace ----- */
function DriveHero({
  title,
  subtitle,
  buttonText,
  buttonLink,
  backgroundImage,
  backgroundColor = '#0f172a',
  textColor = '#ffffff',
  context,
}: BlockPropsWithContext<ExtendedHeroBlockProps>) {
  const isPreview = context?.mode === 'preview';
  const hasImage = backgroundImage && backgroundImage.trim() !== '';

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden px-6 py-12 md:px-12 md:py-16 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="space-y-5">
          <span
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur"
            style={{ color: textColor }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Livraison en 2h
          </span>
          <h1
            className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-5xl"
            style={{ color: textColor }}
          >
            {title || 'Votre titre principal'}
          </h1>
          {subtitle && (
            <p
              className="max-w-xl text-base opacity-80 md:text-lg"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
          )}
          {buttonText && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isPreview ? (
                <Button size="lg" className="block-button pointer-events-none gap-2">
                  {buttonText}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="lg" asChild className="block-button gap-2">
                  <a href={buttonLink || '#'}>
                    {buttonText}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="relative h-[220px] overflow-hidden rounded-2xl bg-white/5 md:h-[320px] lg:h-[400px]">
          {hasImage ? (
            <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid grid-cols-3 gap-2 p-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ----- BAKERY — Centré minimal, ornements serif, vibe artisan ----- */
function BakeryHero({
  title,
  subtitle,
  buttonText,
  buttonLink,
  backgroundImage,
  context,
}: BlockPropsWithContext<ExtendedHeroBlockProps>) {
  const isPreview = context?.mode === 'preview';
  const hasImage = backgroundImage && backgroundImage.trim() !== '';
  // Palette fixe : design pensé pour fond crème → couleur de texte sombre garantie lisible.
  const backgroundColor = '#fef3c7';
  const textColor = '#78350f';

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden px-6 py-16 text-center md:py-24',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{
        backgroundColor,
        backgroundImage: hasImage
          ? `linear-gradient(rgba(254, 243, 199, 0.85), rgba(254, 243, 199, 0.85)), url(${backgroundImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={context?.onSelect}
    >
      <div className="relative mx-auto max-w-2xl space-y-6">
        <div
          className="flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] opacity-70"
          style={{ color: textColor }}
        >
          <span className="h-px w-10 bg-current" />
          <span>Artisan</span>
          <span className="h-px w-10 bg-current" />
        </div>
        <h1
          className="text-3xl font-semibold italic leading-tight sm:text-4xl md:text-5xl lg:text-6xl"
          style={{ color: textColor }}
        >
          {title || 'Votre titre principal'}
        </h1>
        {subtitle && (
          <p
            className="mx-auto max-w-lg text-base opacity-80 md:text-lg"
            style={{ color: textColor }}
          >
            {subtitle}
          </p>
        )}
        {buttonText && (
          <div className="pt-2">
            {isPreview ? (
              <Button size="lg" className="block-button pointer-events-none">
                {buttonText}
              </Button>
            ) : (
              <Button size="lg" asChild className="block-button">
                <a href={buttonLink || '#'}>{buttonText}</a>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ----- RESTAURANT — Sombre, split avec données chiffrées ----- */
function RestaurantHero({
  title,
  subtitle,
  buttonText,
  buttonLink,
  backgroundImage,
  backgroundColor = '#1c1917',
  textColor = '#fafaf9',
  context,
}: BlockPropsWithContext<ExtendedHeroBlockProps>) {
  const isPreview = context?.mode === 'preview';
  const hasImage = backgroundImage && backgroundImage.trim() !== '';

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden px-6 py-16 md:px-12 md:py-24 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      {hasImage && (
        <>
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </>
      )}
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div className="space-y-6">
          <div
            className="flex items-center gap-3 text-xs uppercase tracking-[0.4em]"
            style={{ color: textColor }}
          >
            <span className="h-px w-12 bg-current opacity-60" />
            <span className="opacity-70">Signature</span>
          </div>
          <h1
            className="text-3xl font-medium italic leading-[1.1] sm:text-4xl md:text-6xl lg:text-7xl"
            style={{ color: textColor }}
          >
            {title || 'Votre titre principal'}
          </h1>
          {subtitle && (
            <p
              className="max-w-xl text-base opacity-80 md:text-lg"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
          )}
          {buttonText && (
            <div className="pt-2">
              {isPreview ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="block-button pointer-events-none border-current bg-transparent"
                  style={{ color: textColor, borderColor: `${textColor}55` }}
                >
                  {buttonText}
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="block-button border-current bg-transparent"
                  style={{ color: textColor, borderColor: `${textColor}55` }}
                >
                  <a href={buttonLink || '#'}>{buttonText}</a>
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { value: '32', label: 'couverts' },
            { value: '< 24h', label: 'du marché' },
            { value: '★★★', label: 'sélection' },
          ].map((s) => (
            <div
              key={s.label}
              className="space-y-1 border-l-2 border-current/40 pl-4"
              style={{ color: textColor }}
            >
              <div className="text-2xl font-medium italic">{s.value}</div>
              <div className="text-[11px] uppercase tracking-[0.25em] opacity-60">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- BEAUTY — Asymétrique avec décor floral, gradient pastel ----- */
function BeautyHero({
  title,
  subtitle,
  buttonText,
  buttonLink,
  backgroundImage,
  context,
}: BlockPropsWithContext<ExtendedHeroBlockProps>) {
  const isPreview = context?.mode === 'preview';
  const hasImage = backgroundImage && backgroundImage.trim() !== '';
  // Palette fixe : fond rose pastel → texte rose foncé garanti lisible, bouton accent assorti.
  const textColor = '#831843';

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden px-6 py-16 md:px-12 md:py-24 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
      }}
      onClick={context?.onSelect}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-pink-400/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <div
            className="flex items-center gap-2 text-xs uppercase tracking-[0.35em]"
            style={{ color: textColor }}
          >
            <span>✦</span>
            <span className="opacity-70">Institut bien-être</span>
            <span>✦</span>
          </div>
          <h1
            className="text-3xl font-light italic leading-tight sm:text-4xl md:text-5xl lg:text-6xl"
            style={{ color: textColor }}
          >
            {title || 'Votre titre principal'}
          </h1>
          {subtitle && (
            <p
              className="max-w-md text-base opacity-80 md:text-lg"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
          )}
          {buttonText && (
            <div className="pt-2">
              {isPreview ? (
                <Button
                  size="lg"
                  className="block-button pointer-events-none"
                  style={{ backgroundColor: textColor }}
                >
                  {buttonText}
                </Button>
              ) : (
                <Button size="lg" asChild className="block-button" style={{ backgroundColor: textColor }}>
                  <a href={buttonLink || '#'}>{buttonText}</a>
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] bg-white/50 shadow-xl md:order-last">
          {hasImage ? (
            <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-32 w-32 rounded-full opacity-40"
                style={{
                  background: `radial-gradient(circle, ${textColor}, transparent 70%)`,
                }}
              />
            </div>
          )}
          <div
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs uppercase tracking-[0.25em] backdrop-blur"
            style={{ color: textColor }}
          >
            Nouveauté
          </div>
        </div>
      </div>
    </section>
  );
}

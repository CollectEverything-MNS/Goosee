'use client';

import {
  Clock,
  Headphones,
  Heart,
  Leaf,
  Lock,
  Shield,
  Sparkles,
  Star,
  Truck,
  Undo,
  Zap,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useSiteTemplate } from '@/hooks/use-site-template';

import { BlockPropsWithContext, FeaturesBlockProps } from './types';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const ICON_MAP: Record<string, any> = {
  truck: Truck,
  undo: Undo,
  lock: Lock,
  headphones: Headphones,
  shield: Shield,
  clock: Clock,
  heart: Heart,
  zap: Zap,
  leaf: Leaf,
  star: Star,
  sparkles: Sparkles,
};

function parseFeatures(raw: unknown): Feature[] {
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as Feature[]) || [];
  } catch {
    return [];
  }
}

const COLUMNS_CLASSES = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
};

export function FeaturesBlock(props: BlockPropsWithContext<FeaturesBlockProps>) {
  const template = useSiteTemplate();

  if (template === 'restaurant') return <RestaurantFeatures {...props} />;
  if (template === 'bakery') return <BakeryFeatures {...props} />;
  if (template === 'beauty') return <BeautyFeatures {...props} />;
  if (template === 'drive') return <DriveFeatures {...props} />;
  return <DefaultFeatures {...props} />;
}

/* ----- DEFAULT — colonnes centrées d'origine ----- */
function DefaultFeatures({
  title,
  features: featuresJson,
  columns = 4,
  backgroundColor,
  textColor,
  context,
}: BlockPropsWithContext<FeaturesBlockProps>) {
  const features = parseFeatures(featuresJson);

  return (
    <section
      className={cn(
        'w-full px-6 py-12 md:px-12 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-7xl">
        {title && (
          <h2
            className="mb-8 text-center text-2xl font-bold md:text-3xl"
            style={{ color: textColor }}
          >
            {title}
          </h2>
        )}
        <div className={cn('grid gap-8', COLUMNS_CLASSES[columns])}>
          {features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] || Shield;
            return (
              <div key={i} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold" style={{ color: textColor }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----- DRIVE — Badges horizontaux compacts, fond clair ----- */
function DriveFeatures({
  title,
  features: featuresJson,
  backgroundColor = '#f8fafc',
  textColor,
  context,
}: BlockPropsWithContext<FeaturesBlockProps>) {
  const features = parseFeatures(featuresJson);

  return (
    <section
      className={cn(
        'w-full px-6 py-10 md:px-12 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-7xl">
        {title && (
          <h2
            className="mb-6 text-xl font-extrabold tracking-tight md:text-2xl"
            style={{ color: textColor }}
          >
            {title}
          </h2>
        )}
        <div className="flex flex-wrap items-stretch gap-3">
          {features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] || Shield;
            return (
              <div
                key={i}
                className="block-card flex min-w-[200px] flex-1 items-center gap-3 border bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight text-foreground">
                    {feature.title}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {feature.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----- BAKERY — Grand chiffres + libellé serif, 2x2 ----- */
function BakeryFeatures({
  title,
  features: featuresJson,
  backgroundColor = '#fffbeb',
  textColor = '#78350f',
  context,
}: BlockPropsWithContext<FeaturesBlockProps>) {
  const features = parseFeatures(featuresJson);

  return (
    <section
      className={cn(
        'w-full px-6 py-16 md:px-12 md:py-20 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-5xl">
        {title && (
          <h2
            className="mb-10 text-center text-3xl font-semibold italic md:text-4xl"
            style={{ color: textColor }}
          >
            {title}
          </h2>
        )}
        <div className="grid gap-px overflow-hidden rounded-2xl bg-amber-200/40 sm:grid-cols-2">
          {features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] || Shield;
            return (
              <div
                key={i}
                className="flex items-start gap-4 bg-white p-6 md:p-8"
                style={{ color: textColor }}
              >
                <div className="shrink-0">
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium italic">{feature.title}</h3>
                  <p className="text-sm opacity-75">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----- RESTAURANT — Ligne narrative épurée avec séparateurs ----- */
function RestaurantFeatures({
  title,
  features: featuresJson,
  backgroundColor = '#1c1917',
  textColor = '#fafaf9',
  context,
}: BlockPropsWithContext<FeaturesBlockProps>) {
  const features = parseFeatures(featuresJson);

  return (
    <section
      className={cn(
        'w-full px-6 py-20 md:px-12 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-5xl">
        {title && (
          <div className="mb-12 text-center">
            <div
              className="text-xs uppercase tracking-[0.4em] opacity-60"
              style={{ color: textColor }}
            >
              Notre maison
            </div>
            <h2
              className="mt-3 text-3xl font-medium italic md:text-4xl"
              style={{ color: textColor }}
            >
              {title}
            </h2>
          </div>
        )}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] || Shield;
            return (
              <div
                key={i}
                className="relative space-y-3 text-center"
                style={{ color: textColor }}
              >
                <Icon className="mx-auto h-6 w-6 opacity-70" strokeWidth={1.25} />
                <div className="mx-auto h-px w-8 bg-current opacity-30" />
                <h3 className="text-base font-medium italic">{feature.title}</h3>
                <p className="text-xs leading-relaxed opacity-60">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----- BEAUTY — Cercles décoratifs avec halo rose ----- */
function BeautyFeatures({
  title,
  features: featuresJson,
  textColor = '#831843',
  context,
}: BlockPropsWithContext<FeaturesBlockProps>) {
  const features = parseFeatures(featuresJson);

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden px-6 py-16 md:px-12 md:py-20 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ background: 'linear-gradient(180deg, #fdf2f8 0%, #fff 100%)' }}
      onClick={context?.onSelect}
    >
      <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        {title && (
          <div className="mb-12 text-center">
            <div
              className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] opacity-70"
              style={{ color: textColor }}
            >
              <span>✦</span>
              <span>Nos engagements</span>
              <span>✦</span>
            </div>
            <h2
              className="mt-3 text-3xl font-light italic md:text-4xl"
              style={{ color: textColor }}
            >
              {title}
            </h2>
          </div>
        )}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] || Shield;
            return (
              <div key={i} className="flex flex-col items-center gap-3 text-center">
                <div
                  className="relative flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${textColor}11` }}
                >
                  <div
                    className="absolute inset-0 rounded-full border opacity-30"
                    style={{ borderColor: textColor }}
                  />
                  <Icon className="h-8 w-8" style={{ color: textColor }} strokeWidth={1.25} />
                </div>
                <h3
                  className="text-base font-light italic"
                  style={{ color: textColor }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed opacity-70"
                  style={{ color: textColor }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

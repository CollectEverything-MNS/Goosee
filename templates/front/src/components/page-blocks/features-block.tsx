'use client';

import { cn } from '@/lib/utils';
import { BlockPropsWithContext, FeaturesBlockProps } from './types';
import { Truck, Undo, Lock, Headphones, Shield, Clock, Heart, Zap } from 'lucide-react';

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
};

const COLUMNS_CLASSES = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
};

export function FeaturesBlock({
  title,
  features: featuresJson,
  columns = 4,
  backgroundColor,
  textColor,
  context,
}: BlockPropsWithContext<FeaturesBlockProps>) {
  let features: Feature[] = [];
  try {
    features = typeof featuresJson === 'string' ? JSON.parse(featuresJson) : featuresJson || [];
  } catch {
    features = [];
  }

  return (
    <section
      className={cn('w-full px-6 py-12 md:px-12 lg:px-20', context?.isSelected && 'ring-2 ring-primary ring-offset-2')}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-7xl">
        {title && (
          <h2 className="text-2xl font-bold text-center md:text-3xl mb-8" style={{ color: textColor }}>
            {title}
          </h2>
        )}
        <div className={cn('grid gap-8', COLUMNS_CLASSES[columns])}>
          {features.map((feature, i) => {
            const IconComponent = ICON_MAP[feature.icon] || Shield;
            return (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <IconComponent className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold" style={{ color: textColor }}>{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

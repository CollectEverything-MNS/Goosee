'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { BlockPropsWithContext, TestimonialsBlockProps } from './types';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  text: string;
  rating?: number;
}

export function TestimonialsBlock({
  title,
  testimonials: testimonialsJson,
  backgroundColor,
  textColor,
  context,
}: BlockPropsWithContext<TestimonialsBlockProps>) {
  let testimonials: Testimonial[] = [];
  try {
    testimonials = typeof testimonialsJson === 'string' ? JSON.parse(testimonialsJson) : testimonialsJson || [];
  } catch {
    testimonials = [];
  }

  return (
    <section
      className={cn('w-full px-6 py-12 md:px-12 lg:px-20', context?.isSelected && 'ring-2 ring-primary ring-offset-2')}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-7xl">
        {title && (
          <h2 className="text-2xl font-bold text-center md:text-3xl" style={{ color: textColor }}>
            {title}
          </h2>
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                {t.rating && (
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={cn('h-4 w-4', j < t.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200')}
                      />
                    ))}
                  </div>
                )}
                <p className="text-sm italic text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold" style={{ color: textColor }}>{t.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

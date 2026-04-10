'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BlockPropsWithContext, FeaturedProductsBlockProps } from './types';
import { Package, ShoppingCart } from 'lucide-react';

interface Product {
  name: string;
  price: string;
  image?: string;
  link?: string;
}

const COLUMNS_CLASSES = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
};

export function FeaturedProductsBlock({
  title,
  subtitle,
  columns = 3,
  products: productsJson,
  backgroundColor,
  textColor,
  context,
}: BlockPropsWithContext<FeaturedProductsBlockProps>) {
  let products: Product[] = [];
  try {
    products = typeof productsJson === 'string' ? JSON.parse(productsJson) : productsJson || [];
  } catch {
    products = [];
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
        {subtitle && (
          <p className="mt-2 text-center text-muted-foreground">{subtitle}</p>
        )}
        <div className={cn('mt-8 grid gap-5', COLUMNS_CLASSES[columns])}>
          {products.map((product, i) => (
            <div
              key={i}
              className="group rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <Package className="h-10 w-10 text-gray-200" />
                )}
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-primary">{product.price}</span>
                  {product.link && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs"
                      asChild={context?.mode !== 'preview'}
                    >
                      {context?.mode === 'preview' ? (
                        <span><ShoppingCart className="h-3.5 w-3.5" /> Ajouter</span>
                      ) : (
                        <a href={product.link}><ShoppingCart className="h-3.5 w-3.5" /> Ajouter</a>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

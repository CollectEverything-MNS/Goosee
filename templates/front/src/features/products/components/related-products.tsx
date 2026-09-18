'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Package } from 'lucide-react';

import { QuickAddButton } from '@/features/cart/components/quick-add-button';
import { useListProducts } from '../usecases/use-list-products';

interface RelatedProductsProps {
  currentId: string;
  categoryIds?: string[];
  limit?: number;
}

function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function mainImage(images?: Array<{ url: string; isMain: boolean }>): string | undefined {
  if (!Array.isArray(images) || images.length === 0) return undefined;
  return (images.find((img) => img.isMain) ?? images[0]).url;
}

export function RelatedProducts({ currentId, categoryIds, limit = 4 }: RelatedProductsProps) {
  const locale = useLocale();
  const { data } = useListProducts();

  const suggestions = useMemo(() => {
    const all = (Array.isArray(data) ? data : []).filter((p: any) => p.id !== currentId);
    const wanted = categoryIds ?? [];
    // Categories en commun d'abord, puis complete avec les autres produits.
    const sameCategory = wanted.length
      ? all.filter((p: any) => {
          const ids = p.categoryIds?.length ? p.categoryIds : [p.categoryId];
          return ids.some((id: string) => wanted.includes(id));
        })
      : [];
    const others = all.filter((p: any) => !sameCategory.includes(p));
    return [...sameCategory, ...others].slice(0, limit);
  }, [data, currentId, categoryIds, limit]);

  if (suggestions.length === 0) return null;

  return (
    <section className="mt-16 border-t pt-10">
      <h2 className="text-xl font-bold md:text-2xl">Vous pourriez aussi aimer</h2>
      <p className="mt-1 text-sm text-muted-foreground">Découvrez d&apos;autres articles de la boutique.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {suggestions.map((product: any) => {
          const image = mainImage(product.images);
          return (
            <Link
              key={product.id}
              href={`/${locale}/produits/${product.id}`}
              className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-10 w-10 text-gray-200" />
                  </div>
                )}
                <QuickAddButton
                  productId={product.id}
                  name={product.name}
                  unitPriceCents={Math.round(Number(product.price) * 100)}
                  disabled={!product.isAvailable || Number(product.stock) <= 0}
                  size="icon"
                  className="absolute bottom-2 right-2 h-9 w-9 rounded-full p-0 opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
                />
              </div>
              <div className="space-y-1 p-3">
                <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
                <p className="text-sm font-bold text-primary">
                  {formatPrice(Number(product.price), locale)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

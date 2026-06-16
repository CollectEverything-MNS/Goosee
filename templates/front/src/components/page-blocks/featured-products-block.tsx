'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Package, ShoppingCart } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSiteTemplate } from '@/hooks/use-site-template';
import { useListProducts } from '@/features/products/usecases/use-list-products';

import { BlockPropsWithContext, FeaturedProductsBlockProps } from './types';

interface Product {
  id?: string;
  name: string;
  price: string;
  image?: string;
  link?: string;
}

type LayoutProps = BlockPropsWithContext<FeaturedProductsBlockProps> & {
  items: Product[];
};

const DEFAULT_LIMIT = 8;

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'name';

interface FeaturedFilters {
  categoryId?: string;
  limit?: number;
  sort?: SortOption;
  availableOnly?: boolean;
}

function sortProducts(products: any[], sort?: SortOption): any[] {
  const list = [...products];
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => Number(a.price) - Number(b.price));
    case 'price-desc':
      return list.sort((a, b) => Number(b.price) - Number(a.price));
    case 'name':
      return list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    case 'recent':
    default:
      return list.sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      );
  }
}

const COLUMNS_CLASSES = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
};

function parseProducts(raw: unknown): Product[] {
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as Product[]) || [];
  } catch {
    return [];
  }
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function mainImageUrl(images?: Array<{ url: string; isMain: boolean; order: number }>): string | undefined {
  if (!Array.isArray(images) || images.length === 0) return undefined;
  const main = images.find((img) => img.isMain) ?? images[0];
  return main?.url;
}

/**
 * Source les produits depuis l'API ; repli sur les produits configures
 * manuellement dans le builder si l'API ne renvoie rien.
 */
function useFeaturedItems(productsJson: unknown, filters: FeaturedFilters): Product[] {
  const locale = useLocale();
  const { data } = useListProducts();
  const { categoryId, limit, sort, availableOnly } = filters;

  return useMemo(() => {
    if (Array.isArray(data) && data.length > 0) {
      let filtered = data as any[];
      if (categoryId) filtered = filtered.filter((p) => p.categoryId === categoryId);
      if (availableOnly) filtered = filtered.filter((p) => p.isAvailable && Number(p.stock) > 0);

      const sorted = sortProducts(filtered, sort);
      const max = limit && limit > 0 ? limit : DEFAULT_LIMIT;

      return sorted.slice(0, max).map((p) => ({
        id: p.id,
        name: p.name,
        price: formatPrice(Number(p.price)),
        image: mainImageUrl(p.images),
        link: `/${locale}/produits/${p.id}`,
      }));
    }
    return parseProducts(productsJson);
  }, [data, productsJson, categoryId, limit, sort, availableOnly, locale]);
}

/** Rend la carte cliquable vers la page detail (sauf en preview builder). */
function CardWrap({
  href,
  isPreview,
  className,
  children,
}: {
  href?: string;
  isPreview?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (href && !isPreview) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return <div className={className}>{children}</div>;
}

export function FeaturedProductsBlock(props: BlockPropsWithContext<FeaturedProductsBlockProps>) {
  const template = useSiteTemplate();
  const items = useFeaturedItems(props.products, {
    categoryId: props.categoryId,
    limit: props.limit,
    sort: props.sort,
    availableOnly: props.availableOnly,
  });
  const layoutProps: LayoutProps = { ...props, items };

  if (template === 'restaurant') return <RestaurantLayout {...layoutProps} />;
  if (template === 'bakery') return <BakeryLayout {...layoutProps} />;
  if (template === 'beauty') return <BeautyLayout {...layoutProps} />;
  if (template === 'drive') return <DriveLayout {...layoutProps} />;
  return <DefaultLayout {...layoutProps} />;
}

/* ----- DEFAULT — cards grid d'origine ----- */
function DefaultLayout({
  title,
  subtitle,
  columns = 3,
  items,
  backgroundColor,
  textColor,
  context,
}: LayoutProps) {
  const isPreview = context?.mode === 'preview';

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
          <h2 className="text-2xl font-bold text-center md:text-3xl" style={{ color: textColor }}>
            {title}
          </h2>
        )}
        {subtitle && <p className="mt-2 text-center text-muted-foreground">{subtitle}</p>}
        <div className={cn('mt-8 grid gap-5', COLUMNS_CLASSES[columns])}>
          {items.map((product, i) => (
            <CardWrap
              key={product.id ?? i}
              href={product.link}
              isPreview={isPreview}
              className="block-card group block border bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden"
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
                  <Button asChild size="sm" variant="outline" className="block-button h-8 gap-1.5 text-xs">
                    <span>
                      <ShoppingCart className="h-3.5 w-3.5" /> Voir
                    </span>
                  </Button>
                </div>
              </div>
            </CardWrap>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- DRIVE — Grille serrée, prix gros, badges promo ----- */
function DriveLayout({
  title,
  subtitle,
  columns = 4,
  items,
  backgroundColor = '#f8fafc',
  textColor,
  context,
}: LayoutProps) {
  const isPreview = context?.mode === 'preview';

  return (
    <section
      className={cn(
        'w-full px-4 py-12 md:px-8 md:py-16 lg:px-12',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          {title && (
            <h2
              className="text-2xl font-extrabold tracking-tight md:text-3xl"
              style={{ color: textColor }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground/70">
              {subtitle}
            </span>
          )}
        </div>
        <div className={cn('grid gap-3 sm:grid-cols-2 md:gap-4', COLUMNS_CLASSES[columns])}>
          {items.map((product, i) => (
            <CardWrap
              key={product.id ?? i}
              href={product.link}
              isPreview={isPreview}
              className="block-card group relative block overflow-hidden bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="absolute right-2 top-2 z-10 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                Promo
              </div>
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <Package className="absolute inset-0 m-auto h-10 w-10 text-slate-300" />
                )}
              </div>
              <div className="space-y-2 p-3">
                <h3 className="line-clamp-2 text-xs font-medium text-foreground">{product.name}</h3>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-extrabold text-primary">{product.price}</span>
                  <Button asChild size="sm" className="block-button h-8 w-8 shrink-0 rounded-full p-0">
                    <span aria-label="Voir">
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </span>
                  </Button>
                </div>
              </div>
            </CardWrap>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- BAKERY — 2 ou 3 cards larges, typo serif, vibe atelier ----- */
function BakeryLayout({
  title,
  subtitle,
  columns,
  items,
  backgroundColor = '#fffbeb',
  textColor = '#78350f',
  context,
}: LayoutProps) {
  const isPreview = context?.mode === 'preview';
  const cols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <section
      className={cn(
        'w-full px-6 py-16 md:px-12 md:py-20 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div
            className="flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] opacity-70"
            style={{ color: textColor }}
          >
            <span className="h-px w-10 bg-current" />
            <span>Sélection</span>
            <span className="h-px w-10 bg-current" />
          </div>
          {title && (
            <h2
              className="mt-4 text-3xl font-semibold italic md:text-4xl"
              style={{ color: textColor }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-base opacity-70" style={{ color: textColor }}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn('grid gap-8', cols)}>
          {items.map((product, i) => (
            <CardWrap
              key={product.id ?? i}
              href={product.link}
              isPreview={isPreview}
              className="block-card group block overflow-hidden bg-white shadow-sm"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-amber-50">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Package className="absolute inset-0 m-auto h-12 w-12 text-amber-200" />
                )}
                <div
                  className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold italic backdrop-blur"
                  style={{ color: textColor }}
                >
                  {product.price}
                </div>
              </div>
              <div className="space-y-3 p-5 text-center">
                <h3 className="text-lg font-medium italic" style={{ color: textColor }}>
                  {product.name}
                </h3>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="block-button mt-2 border-current bg-transparent text-xs"
                  style={{ color: textColor, borderColor: `${textColor}55` }}
                >
                  <span>Découvrir</span>
                </Button>
              </div>
            </CardWrap>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- RESTAURANT — Liste menu épurée, prix en bout de ligne ----- */
function RestaurantLayout({
  title,
  subtitle,
  items,
  backgroundColor = '#fafaf9',
  textColor = '#1c1917',
  context,
}: LayoutProps) {
  const isPreview = context?.mode === 'preview';

  return (
    <section
      className={cn(
        'w-full px-6 py-20 md:px-12 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <div
            className="text-xs uppercase tracking-[0.4em] opacity-60"
            style={{ color: textColor }}
          >
            La carte
          </div>
          {title && (
            <h2
              className="mt-3 text-4xl font-medium italic md:text-5xl"
              style={{ color: textColor }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-3 text-sm opacity-70" style={{ color: textColor }}>
              {subtitle}
            </p>
          )}
          <div
            className="mx-auto mt-6 h-px w-16"
            style={{ backgroundColor: textColor, opacity: 0.3 }}
          />
        </div>
        <ul className="space-y-7">
          {items.map((product, i) => (
            <li key={product.id ?? i}>
              {product.link && !isPreview ? (
                <Link href={product.link} className="group block">
                  <ProductRow product={product} textColor={textColor} />
                </Link>
              ) : (
                <ProductRow product={product} textColor={textColor} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ProductRow({ product, textColor }: { product: Product; textColor: string }) {
  return (
    <div className="flex items-start gap-4">
      {product.image && (
        <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-full sm:block">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-baseline gap-3">
          <span className="text-base font-medium italic" style={{ color: textColor }}>
            {product.name}
          </span>
          <span
            className="flex-1 border-b border-dotted opacity-40"
            style={{ borderColor: textColor }}
          />
          <span className="text-base font-medium" style={{ color: textColor }}>
            {product.price}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ----- BEAUTY — Cards très arrondies, halos rose, séparateurs ornés ----- */
function BeautyLayout({
  title,
  subtitle,
  columns = 3,
  items,
  textColor = '#831843',
  context,
}: LayoutProps) {
  const isPreview = context?.mode === 'preview';

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden px-6 py-16 md:px-12 md:py-20 lg:px-20',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{
        background: 'linear-gradient(180deg, #fff 0%, #fdf2f8 100%)',
      }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div
            className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] opacity-70"
            style={{ color: textColor }}
          >
            <span>✦</span>
            <span>Nos prestations</span>
            <span>✦</span>
          </div>
          {title && (
            <h2
              className="mt-4 text-3xl font-light italic md:text-4xl"
              style={{ color: textColor }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm opacity-70" style={{ color: textColor }}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn('grid gap-6', COLUMNS_CLASSES[columns])}>
          {items.map((product, i) => (
            <CardWrap
              key={product.id ?? i}
              href={product.link}
              isPreview={isPreview}
              className="block-card group block overflow-hidden bg-white shadow-md transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden bg-pink-50">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Package className="absolute inset-0 m-auto h-10 w-10 text-pink-200" />
                )}
              </div>
              <div className="space-y-2 p-5 text-center">
                <h3 className="text-base font-light italic" style={{ color: textColor }}>
                  {product.name}
                </h3>
                <div
                  className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] opacity-70"
                  style={{ color: textColor }}
                >
                  <span className="h-px w-6 bg-current opacity-50" />
                  <span>{product.price}</span>
                  <span className="h-px w-6 bg-current opacity-50" />
                </div>
                <Button
                  asChild
                  size="sm"
                  className="block-button mt-3 text-xs"
                  style={{ backgroundColor: textColor }}
                >
                  <span>Réserver</span>
                </Button>
              </div>
            </CardWrap>
          ))}
        </div>
      </div>
    </section>
  );
}

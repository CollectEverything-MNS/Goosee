'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft, Loader2, Minus, Package, Plus, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useGetProduct } from '@/features/products/usecases/use-get-product';
import { RelatedProducts } from '@/features/products/components/related-products';
import { useCartContext } from '@/features/cart/context/cart-provider';

function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const locale = useLocale();
  const { data: product, isLoading, isError } = useGetProduct(params.id);
  const cart = useCartContext();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = useMemo(() => {
    if (!product?.images?.length) return [];
    return [...product.images].sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.order - b.order);
  }, [product]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <Package className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Produit introuvable</h1>
        <p className="text-muted-foreground">Ce produit n&apos;existe pas ou n&apos;est plus disponible.</p>
        <Button asChild variant="outline">
          <Link href={`/${locale}`}>Retour à l&apos;accueil</Link>
        </Button>
      </main>
    );
  }

  const outOfStock = !product.isAvailable || product.stock <= 0;

  const handleAddToCart = () => {
    cart?.addItem(
      {
        productId: product.id,
        name: product.name,
        unitPriceCents: Math.round(Number(product.price) * 100),
        quantity,
      },
      { openDrawer: true }
    );
  };

  return (
    <main className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground">
          <Link href={`/${locale}`}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Galerie */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl border bg-white">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]?.url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-16 w-16 text-gray-200" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      'h-20 w-20 overflow-hidden rounded-lg border bg-white transition-all',
                      i === activeImage ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80',
                    )}
                  >
                    <img src={img.url} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {outOfStock ? (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">
                    Indisponible
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    En stock
                  </Badge>
                )}
                {product.tags?.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>
              <p className="mt-2 text-3xl font-extrabold text-primary">
                {formatPrice(product.price, locale)}
              </p>
            </div>

            {product.description && (
              <p className="leading-relaxed text-muted-foreground">{product.description}</p>
            )}

            {product.attributes?.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Caractéristiques
                </h2>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {product.attributes.map((attr) => (
                    <div key={attr.id} className="flex justify-between gap-2 rounded-md bg-white px-3 py-2">
                      <dt className="text-muted-foreground">{attr.key}</dt>
                      <dd className="font-medium">{attr.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <Separator />

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-lg border bg-white">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={outOfStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={outOfStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button className="flex-1 gap-2" size="lg" onClick={handleAddToCart} disabled={outOfStock}>
                <ShoppingCart className="h-5 w-5" />
                {outOfStock ? 'Indisponible' : 'Ajouter au panier'}
              </Button>
            </div>

            {!outOfStock && product.stock <= 5 && (
              <p className="text-sm text-amber-600">Plus que {product.stock} en stock !</p>
            )}
          </div>
        </div>

        <RelatedProducts
          currentId={product.id}
          categoryIds={product.categoryIds?.length ? product.categoryIds : [product.categoryId]}
        />
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCartContext } from '@/features/cart/context/cart-provider';
import { useCreateOrder } from '@/features/cart/usecases/use-create-order';
import { useCreatePayment } from '@/features/cart/usecases/use-create-payment';

function formatPrice(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const cart = useCartContext();
  const [email, setEmail] = useState('');

  const createOrder = useCreateOrder();
  const createPayment = useCreatePayment();
  const isSubmitting = createOrder.isPending || createPayment.isPending;

  const items = cart?.items ?? [];
  const totalCents = cart?.totalCents ?? 0;

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Votre panier est vide</h1>
        <p className="text-muted-foreground">Ajoutez des articles avant de passer commande.</p>
        <Button asChild variant="outline">
          <Link href={`/${locale}`}>Retour à la boutique</Link>
        </Button>
      </main>
    );
  }

  const handleSubmit = async () => {
    if (!EMAIL_REGEX.test(email)) {
      toast.error('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    try {
      // 1. Crée la commande (le total est recalculé côté serveur).
      const order = await createOrder.mutateAsync({
        customerEmail: email,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          unitPriceCents: item.unitPriceCents,
          quantity: item.quantity,
        })),
      });

      // 2. Crée l'intention de paiement rattachée à la commande.
      await createPayment.mutateAsync({ orderId: order.id, amountCents: order.totalCents });

      // 3. Vide le panier et redirige vers la confirmation.
      cart?.clear();
      router.push(`/${locale}/checkout/success?order=${order.id}`);
    } catch {
      toast.error("Le paiement n'a pas pu être initié. Réessayez.");
    }
  };

  return (
    <main className="bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">Finaliser la commande</h1>

        <div className="mt-8 space-y-6">
          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">Votre commande</h2>
            <ul className="mt-4 divide-y">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm">
                    {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="text-sm font-medium">
                    {formatPrice(item.unitPriceCents * item.quantity, locale)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(totalCents, locale)}</span>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">Vos coordonnées</h2>
            <div className="mt-4 space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                La confirmation de commande sera envoyée à cette adresse.
              </p>
            </div>
          </section>

          <Button className="w-full gap-2" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
            Payer {formatPrice(totalCents, locale)}
          </Button>
        </div>
      </div>
    </main>
  );
}

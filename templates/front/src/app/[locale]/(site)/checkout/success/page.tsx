'use client';

import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCartContext } from '@/features/cart/context/cart-provider';

function CheckoutSuccess() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const cart = useCartContext();

  // Paiement confirmé (retour Stripe) : on vide le panier une seule fois.
  const cleared = useRef(false);
  useEffect(() => {
    if (cart && !cleared.current) {
      cleared.current = true;
      cart.clear();
    }
  }, [cart]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-5 px-4 py-12 text-center">
      <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      <h1 className="text-2xl font-bold">Merci pour votre commande !</h1>
      <p className="text-muted-foreground">
        Votre commande a bien été enregistrée. Vous recevrez un e-mail de confirmation.
      </p>
      {orderId && (
        <p className="rounded-md bg-muted px-4 py-2 font-mono text-sm">
          N° de commande : CMD-{orderId.slice(0, 8).toUpperCase()}
        </p>
      )}
      <Button asChild className="mt-2">
        <Link href={`/${locale}`}>Continuer mes achats</Link>
      </Button>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccess />
    </Suspense>
  );
}

'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

function CheckoutSuccess() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-5 px-4 py-12 text-center">
      <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      <h1 className="text-2xl font-bold">Merci pour votre commande !</h1>
      <p className="text-muted-foreground">
        Votre commande a bien été enregistrée. Vous recevrez un e-mail de confirmation.
      </p>
      {orderId && (
        <p className="rounded-md bg-muted px-4 py-2 font-mono text-sm">
          N° de commande : {orderId}
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

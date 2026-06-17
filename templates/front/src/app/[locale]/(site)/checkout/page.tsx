'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { stripePromise } from '@/lib/stripe';
import { useCartContext } from '@/features/cart/context/cart-provider';
import { useCreateOrder } from '@/features/cart/usecases/use-create-order';
import { useCreatePayment } from '@/features/cart/usecases/use-create-payment';
import { useGetMe } from '@/features/account/usecases/use-get-me';

function formatPrice(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Étape paiement : formulaire carte Stripe (Payment Element) + confirmation.
function PaymentStep({
  orderId,
  totalCents,
  locale,
}: {
  orderId: string;
  totalCents: number;
  locale: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    // Confirme le paiement ; Stripe redirige vers return_url en cas de succès.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/${locale}/checkout/success?order=${orderId}`,
      },
    });
    if (error) {
      toast.error(error.message ?? 'Le paiement a été refusé.');
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="text-lg font-semibold">Paiement</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Mode test — carte : 4242 4242 4242 4242, date future, CVC quelconque.
      </p>
      <div className="mt-4">
        <PaymentElement />
      </div>
      <Button
        className="mt-6 w-full gap-2"
        size="lg"
        onClick={handlePay}
        disabled={!stripe || submitting}
      >
        {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
        Payer {formatPrice(totalCents, locale)}
      </Button>
    </section>
  );
}

export default function CheckoutPage() {
  const locale = useLocale();
  const cart = useCartContext();
  const [email, setEmail] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);

  // Client connecté (facultatif) : rattache la commande à son compte pour l'espace « Mes commandes ».
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token');
  const { data: profile } = useGetMe(hasToken);

  const createOrder = useCreateOrder();
  const createPayment = useCreatePayment();
  const isPreparing = createOrder.isPending || createPayment.isPending;

  // Pré-remplit l'e-mail avec celui du compte connecté.
  useEffect(() => {
    if (profile?.email) setEmail((prev) => prev || profile.email);
  }, [profile?.email]);

  const items = cart?.items ?? [];
  const totalCents = cart?.totalCents ?? 0;

  if (items.length === 0 && !clientSecret) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Votre panier est vide</h1>
        <Button asChild variant="outline">
          <Link href={`/${locale}`}>Retour à la boutique</Link>
        </Button>
      </main>
    );
  }

  const startPayment = async () => {
    if (!EMAIL_REGEX.test(email)) {
      toast.error('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        customerEmail: email,
        customerId: profile?.id,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          unitPriceCents: i.unitPriceCents,
          quantity: i.quantity,
        })),
      });
      const payment = await createPayment.mutateAsync({
        orderId: order.id,
        amountCents: order.totalCents,
      });
      setOrderId(order.id);
      setOrderTotal(order.totalCents);
      setClientSecret(payment.clientSecret);
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
              <span>{formatPrice(clientSecret ? orderTotal : totalCents, locale)}</span>
            </div>
          </section>

          {!clientSecret ? (
            <>
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
                </div>
              </section>
              {!stripePromise ? (
                <p className="text-sm text-red-600">
                  Stripe n&apos;est pas configuré (clé publique manquante).
                </p>
              ) : (
                <Button className="w-full gap-2" size="lg" onClick={startPayment} disabled={isPreparing}>
                  {isPreparing && <Loader2 className="h-5 w-5 animate-spin" />}
                  Continuer vers le paiement
                </Button>
              )}
            </>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentStep orderId={orderId!} totalCents={orderTotal} locale={locale} />
            </Elements>
          )}
        </div>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ArrowLeft, Loader2, Lock, Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { stripePromise } from '@/lib/stripe';
import { api } from '@/lib/api-client';
import { useCartContext } from '@/features/cart/context/cart-provider';
import { useCreateOrder } from '@/features/cart/usecases/use-create-order';
import { useCreatePayment } from '@/features/cart/usecases/use-create-payment';
import { useGetMe } from '@/features/account/usecases/use-get-me';
import { useListProducts } from '@/features/products/usecases/use-list-products';

const demoPayment = process.env.NEXT_PUBLIC_DEMO_PAYMENT === 'true';

function formatPrice(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SummaryItem {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

// Recap de la commande avec miniatures produits (image a gauche du texte).
function OrderSummary({
  items,
  imageOf,
  totalCents,
  locale,
}: {
  items: SummaryItem[];
  imageOf: (productId: string) => string | undefined;
  totalCents: number;
  locale: string;
}) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold">Votre commande</h2>
      <ul className="mt-4 space-y-4">
        {items.map((item) => {
          const image = imageOf(item.productId);
          return (
            <li key={item.productId} className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0">
                <div className="h-full w-full overflow-hidden rounded-lg border bg-gray-50">
                  {image ? (
                    <img src={image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <span className="absolute -right-1.5 -top-1.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">{item.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatPrice(item.unitPriceCents, locale)} l&apos;unité
                </p>
              </div>
              <span className="text-sm font-semibold">
                {formatPrice(item.unitPriceCents * item.quantity, locale)}
              </span>
            </li>
          );
        })}
      </ul>
      <Separator className="my-4" />
      <div className="flex items-center justify-between text-base font-semibold">
        <span>Total</span>
        <span>{formatPrice(totalCents, locale)}</span>
      </div>
    </section>
  );
}

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
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold">Paiement</h2>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        Paiement sécurisé — mode test : 4242 4242 4242 4242, date future, CVC quelconque.
      </p>
      <div className="mt-5">
        <PaymentElement />
      </div>
      <Button
        className="mt-6 w-full gap-2"
        size="lg"
        onClick={handlePay}
        disabled={!stripe || submitting}
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
        Payer {formatPrice(totalCents, locale)}
      </Button>
    </section>
  );
}

export default function CheckoutPage() {
  const locale = useLocale();
  const cart = useCartContext();
  const [email, setEmail] = useState('');
  const [billing, setBilling] = useState({
    fullName: '',
    line1: '',
    postalCode: '',
    city: '',
    country: '',
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [demoSubmitting, setDemoSubmitting] = useState(false);

  const setBillingField =
    (key: keyof typeof billing) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setBilling((prev) => ({ ...prev, [key]: e.target.value }));

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token');
  const { data: profile } = useGetMe(hasToken);

  // Liste produits pour retrouver l'image principale de chaque ligne du panier.
  const { data: products } = useListProducts();
  const imageOf = useMemo(() => {
    const map = new Map<string, string>();
    (Array.isArray(products) ? products : []).forEach((p: any) => {
      const main = p.images?.find((i: any) => i.isMain) ?? p.images?.[0];
      if (main?.url) map.set(p.id, main.url);
    });
    return (productId: string) => map.get(productId);
  }, [products]);

  const createOrder = useCreateOrder();
  const createPayment = useCreatePayment();
  const isPreparing = demoSubmitting || createOrder.isPending || createPayment.isPending;

  useEffect(() => {
    if (profile?.email) setEmail((prev) => prev || profile.email);
  }, [profile?.email]);

  // Pré-remplit l'adresse de facturation avec celle du compte connecté.
  useEffect(() => {
    if (!profile) return;
    setBilling((prev) => ({
      fullName: prev.fullName || `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim(),
      line1: prev.line1 || profile.address || '',
      postalCode: prev.postalCode || profile.postaleCode || '',
      city: prev.city || profile.city || '',
      country: prev.country || profile.country || '',
    }));
  }, [profile]);

  const items = cart?.items ?? [];
  const totalCents = cart?.totalCents ?? 0;

  if (items.length === 0 && !clientSecret) {
    return (
      <main className="app-surface mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Votre panier est vide</h1>
        <h2 className="sr-only">Panier</h2>
        <p className="text-muted-foreground">Ajoutez des produits avant de passer commande.</p>
        <Button asChild>
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
    const billingFilled = Object.values(billing).every((v) => v.trim().length >= 2);
    if (!billingFilled) {
      toast.error('Veuillez renseigner votre adresse de facturation.');
      return;
    }
    setDemoSubmitting(true);
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
        billingAddress: {
          fullName: billing.fullName.trim(),
          line1: billing.line1.trim(),
          postalCode: billing.postalCode.trim(),
          city: billing.city.trim(),
          country: billing.country.trim(),
        },
      });
      const payment = await createPayment.mutateAsync({
        orderId: order.id,
        amountCents: order.totalCents,
      });
      if (demoPayment) {
        const providerRef = payment.payment.providerRef;
        if (!providerRef?.startsWith('pi_mock_')) throw new Error('Le prestataire de démonstration est indisponible.');
        await api.post('/payments/webhook', { providerRef, status: 'succeeded' });
        window.location.assign(`/${locale}/checkout/success?order=${order.id}`);
        return;
      }
      setOrderId(order.id);
      setOrderTotal(order.totalCents);
      setClientSecret(payment.clientSecret);
      setDemoSubmitting(false);
    } catch (err: any) {
      setDemoSubmitting(false);
      const msg = err?.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(', ')
          : msg || "Le paiement n'a pas pu être initié. Réessayez.",
      );
    }
  };

  const summaryItems: SummaryItem[] = clientSecret
    ? items
    : items.map((i) => ({
        productId: i.productId,
        name: i.name,
        unitPriceCents: i.unitPriceCents,
        quantity: i.quantity,
      }));

  return (
    <main className="app-surface min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-2 text-muted-foreground">
          <Link href={`/${locale}`}>
            <ArrowLeft className="h-4 w-4" />
            Continuer mes achats
          </Link>
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">Finaliser la commande</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <Lock className="h-3.5 w-3.5" />
            Paiement sécurisé
          </span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Colonne gauche : coordonnées + paiement */}
          <div className="space-y-6">
            {!clientSecret ? (
              <>
                <section className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h2 className="text-base font-semibold">Vos coordonnées</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Le récapitulatif et la facture seront envoyés à cette adresse.
                  </p>
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

                <section className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h2 className="text-base font-semibold">Adresse de facturation</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Elle figurera sur votre facture.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="b-fullName">Nom complet</Label>
                      <Input
                        id="b-fullName"
                        placeholder="Jean Dupont"
                        value={billing.fullName}
                        onChange={setBillingField('fullName')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="b-line1">Adresse</Label>
                      <Input
                        id="b-line1"
                        placeholder="10 rue de la Paix"
                        value={billing.line1}
                        onChange={setBillingField('line1')}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="b-postalCode">Code postal</Label>
                        <Input
                          id="b-postalCode"
                          placeholder="57000"
                          value={billing.postalCode}
                          onChange={setBillingField('postalCode')}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="b-city">Ville</Label>
                        <Input
                          id="b-city"
                          placeholder="Metz"
                          value={billing.city}
                          onChange={setBillingField('city')}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="b-country">Pays</Label>
                      <Input
                        id="b-country"
                        placeholder="France"
                        value={billing.country}
                        onChange={setBillingField('country')}
                      />
                    </div>
                  </div>
                </section>
                {!stripePromise && !demoPayment ? (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    Stripe n&apos;est pas configuré (clé publique manquante).
                  </p>
                ) : (
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={startPayment}
                    disabled={isPreparing}
                  >
                    {isPreparing && <Loader2 className="h-5 w-5 animate-spin" />}
                    {demoPayment ? 'Simuler le paiement (aucun débit)' : 'Continuer vers le paiement'}
                  </Button>
                )}
              </>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentStep orderId={orderId!} totalCents={orderTotal} locale={locale} />
              </Elements>
            )}
          </div>

          {/* Colonne droite : récap commande (sticky) */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <OrderSummary
              items={summaryItems}
              imageOf={imageOf}
              totalCents={clientSecret ? orderTotal : totalCents}
              locale={locale}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

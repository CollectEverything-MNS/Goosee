import { loadStripe, Stripe } from '@stripe/stripe-js';

// Clé publique Stripe (test) injectée au build (NEXT_PUBLIC_*). Identique pour tous les
// tenants (compte Stripe de la plateforme en mode test pour le POC).
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const stripePromise: Promise<Stripe | null> | null = publishableKey
  ? loadStripe(publishableKey)
  : null;

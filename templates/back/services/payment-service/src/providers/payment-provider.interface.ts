import { Payment, PaymentStatus } from '../entities/payment.entity';

// Résultat de la création d'une intention de paiement chez le prestataire.
export interface PaymentIntentResult {
  // Identifiant côté prestataire (ex. PaymentIntent Stripe « pi_... »).
  providerRef: string;
  // Secret remis au front pour confirmer le paiement (Stripe Elements).
  clientSecret: string;
}

// Événement de paiement reçu via webhook, normalisé pour le usecase.
export interface PaymentWebhookEvent {
  providerRef: string;
  status: PaymentStatus;
}

// Contrat d'un prestataire de paiement. Permet de brancher Stripe (ou un autre)
// sans toucher aux usecases. L'implémentation concrète vit dans implements/.
export abstract class IPaymentProvider {
  // Crée l'intention de paiement et renvoie de quoi confirmer côté front.
  abstract createIntent(payment: Payment): Promise<PaymentIntentResult>;

  // Vérifie l'authenticité du webhook puis le normalise en événement métier.
  // Renvoie null pour un événement non pertinent (à acquitter sans action).
  abstract parseWebhookEvent(
    rawBody: Buffer | string,
    signature?: string
  ): PaymentWebhookEvent | null;
}

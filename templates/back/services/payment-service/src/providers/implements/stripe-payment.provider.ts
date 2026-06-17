import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import {
  IPaymentProvider,
  PaymentIntentResult,
  PaymentWebhookEvent,
} from '../payment-provider.interface';

/**
 * Provider Stripe (mode test). Sans STRIPE_SECRET_KEY, retombe en mode mock pour ne pas
 * bloquer le dev/CI (intention simulée + webhook piloté par un corps JSON). Avec la clé,
 * utilise le vrai SDK : PaymentIntent (confirmé côté front via Stripe Elements) et
 * vérification de signature du webhook.
 */
@Injectable()
export class StripePaymentProvider implements IPaymentProvider {
  private readonly logger = new Logger(StripePaymentProvider.name);
  private readonly secretKey?: string;
  private readonly webhookSecret?: string;
  private readonly stripe?: Stripe;

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (this.secretKey) {
      this.stripe = new Stripe(this.secretKey);
    } else {
      this.logger.warn('STRIPE_SECRET_KEY absent : provider en mode mock (aucun paiement réel).');
    }
  }

  private get isMock(): boolean {
    return !this.stripe;
  }

  async createIntent(payment: Payment): Promise<PaymentIntentResult> {
    if (this.isMock) {
      // Mode mock : on simule une intention pour ne pas bloquer le flux.
      return {
        providerRef: `pi_mock_${payment.id}`,
        clientSecret: `pi_mock_${payment.id}_secret`,
      };
    }

    const intent = await this.stripe!.paymentIntents.create({
      amount: payment.amountCents,
      currency: payment.currency,
      // Méthodes de paiement automatiques (carte en test) ; pas de redirection forcée.
      automatic_payment_methods: { enabled: true },
      metadata: { paymentId: payment.id, orderId: payment.orderId },
    });

    return { providerRef: intent.id, clientSecret: intent.client_secret! };
  }

  parseWebhookEvent(rawBody: Buffer | string, signature?: string): PaymentWebhookEvent | null {
    if (this.isMock) {
      // Mode mock : corps JSON { providerRef, status } pour piloter le statut (tests).
      let body: { providerRef?: string; status?: string };
      try {
        body = JSON.parse(rawBody.toString());
      } catch {
        throw new BadRequestException('Webhook mock : corps JSON invalide.');
      }
      return {
        providerRef: body.providerRef!,
        status: this.normalizeStatus(body.status!),
      };
    }

    if (!this.webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET manquant pour vérifier le webhook.');
    }
    if (!signature) {
      throw new BadRequestException('Signature Stripe absente.');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe!.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Signature Stripe invalide : ${(err as Error).message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        return { providerRef: (event.data.object as Stripe.PaymentIntent).id, status: 'succeeded' };
      case 'payment_intent.payment_failed':
        return { providerRef: (event.data.object as Stripe.PaymentIntent).id, status: 'failed' };
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const ref = typeof charge.payment_intent === 'string' ? charge.payment_intent : '';
        return ref ? { providerRef: ref, status: 'refunded' } : null;
      }
      default:
        // Événement non pertinent : on l'acquitte sans rien changer.
        return null;
    }
  }

  private normalizeStatus(status: string): PaymentStatus {
    const allowed: PaymentStatus[] = ['pending', 'succeeded', 'failed', 'refunded'];
    if (!allowed.includes(status as PaymentStatus)) {
      throw new BadRequestException(`Statut de paiement inconnu : ${status}`);
    }
    return status as PaymentStatus;
  }
}

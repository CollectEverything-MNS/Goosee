import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import {
  IPaymentProvider,
  PaymentIntentResult,
  PaymentWebhookEvent,
} from '../payment-provider.interface';

/**
 * SCAFFOLD Stripe — à compléter par Florent.
 *
 * Le service tourne sans Stripe (mode mock) pour pouvoir tester le flux de bout en
 * bout. Pour activer le vrai paiement :
 *   1. `yarn add stripe` dans ce service.
 *   2. instancier le SDK avec STRIPE_SECRET_KEY (voir le constructeur).
 *   3. remplacer les blocs `TODO(Florent)` ci-dessous par les appels Stripe réels.
 * Tant que STRIPE_SECRET_KEY est absent, on reste en mock (utile en dev/CI).
 */
@Injectable()
export class StripePaymentProvider implements IPaymentProvider {
  private readonly logger = new Logger(StripePaymentProvider.name);
  private readonly secretKey?: string;
  private readonly webhookSecret?: string;
  // private readonly stripe?: Stripe; // TODO(Florent): décommenter après `yarn add stripe`

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    // TODO(Florent): if (this.secretKey) this.stripe = new Stripe(this.secretKey);
    if (!this.secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY absent : provider en mode mock (aucun paiement réel).');
    }
  }

  private get isMock(): boolean {
    return !this.secretKey;
  }

  async createIntent(payment: Payment): Promise<PaymentIntentResult> {
    if (this.isMock) {
      // Mode mock : on simule une intention pour ne pas bloquer le flux.
      return {
        providerRef: `pi_mock_${payment.id}`,
        clientSecret: `pi_mock_${payment.id}_secret`,
      };
    }

    // TODO(Florent): paiement réel
    // const intent = await this.stripe.paymentIntents.create({
    //   amount: payment.amountCents,
    //   currency: payment.currency,
    //   metadata: { paymentId: payment.id, orderId: payment.orderId },
    // });
    // return { providerRef: intent.id, clientSecret: intent.client_secret! };
    throw new Error('Stripe non câblé : implémenter createIntent (TODO Florent).');
  }

  parseWebhookEvent(rawBody: Buffer | string, signature?: string): PaymentWebhookEvent {
    if (this.isMock) {
      // Mode mock : on accepte un corps JSON { providerRef, status } pour piloter le
      // statut manuellement (tests). En prod Stripe, ce chemin n'est jamais pris.
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

    // TODO(Florent): vérifier la signature et mapper l'événement Stripe
    // const event = this.stripe.webhooks.constructEvent(rawBody, signature!, this.webhookSecret!);
    // switch (event.type) {
    //   case 'payment_intent.succeeded':
    //     return { providerRef: event.data.object.id, status: 'succeeded' };
    //   case 'payment_intent.payment_failed':
    //     return { providerRef: event.data.object.id, status: 'failed' };
    //   case 'charge.refunded':
    //     return { providerRef: event.data.object.payment_intent, status: 'refunded' };
    // }
    void signature;
    void this.webhookSecret;
    throw new Error('Stripe non câblé : implémenter parseWebhookEvent (TODO Florent).');
  }

  private normalizeStatus(status: string): PaymentStatus {
    const allowed: PaymentStatus[] = ['pending', 'succeeded', 'failed', 'refunded'];
    if (!allowed.includes(status as PaymentStatus)) {
      throw new BadRequestException(`Statut de paiement inconnu : ${status}`);
    }
    return status as PaymentStatus;
  }
}

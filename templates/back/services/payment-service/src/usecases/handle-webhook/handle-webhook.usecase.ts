import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentRepository } from '../../repositories/payment.repository';
import { IPaymentProvider } from '../../providers/payment-provider.interface';
import { PaymentStatus } from '../../entities/payment.entity';

// Correspondance statut de paiement -> statut de commande (order-service ne connaît que
// pending | paid | shipped | cancelled). On ne propage que les transitions pertinentes.
const ORDER_STATUS_BY_PAYMENT: Partial<Record<PaymentStatus, string>> = {
  succeeded: 'paid',
  failed: 'cancelled',
  refunded: 'cancelled',
};

@Injectable()
export class HandleWebhookUseCase {
  private readonly logger = new Logger(HandleWebhookUseCase.name);

  constructor(
    private readonly paymentRepo: IPaymentRepository,
    private readonly paymentProvider: IPaymentProvider,
    private readonly config: ConfigService
  ) {}

  async execute(rawBody: Buffer | string, signature?: string) {
    // Le provider vérifie l'authenticité (signature Stripe) puis normalise l'événement.
    const event = this.paymentProvider.parseWebhookEvent(rawBody, signature);

    // Événement non pertinent (autre type Stripe) : on acquitte sans rien faire.
    if (!event) {
      return { received: true, ignored: true };
    }

    const payment = await this.paymentRepo.findByProviderRef(event.providerRef);
    if (!payment) {
      // On le signale sans faire échouer le webhook (Stripe attend un 2xx).
      this.logger.warn(`Aucun paiement pour providerRef=${event.providerRef}`);
      throw new NotFoundException('Payment not found for providerRef');
    }

    payment.status = event.status;
    await this.paymentRepo.save(payment);

    // Propage le résultat à la commande pour que l'admin la voie passer à « Payée ».
    await this.syncOrderStatus(payment.orderId, event.status);

    return { received: true, status: event.status };
  }

  // Met à jour le statut de la commande côté order-service. Toute erreur est journalisée
  // mais n'interrompt pas le webhook : Stripe attend un 2xx, sinon il rejoue l'événement.
  private async syncOrderStatus(orderId: string, paymentStatus: PaymentStatus) {
    const orderStatus = ORDER_STATUS_BY_PAYMENT[paymentStatus];
    if (!orderId || !orderStatus) {
      return;
    }

    const host = this.config.get<string>('ORDER_SERVICE_HOST', 'localhost');
    const port = this.config.get<string>('ORDER_SERVICE_PORT', '3007');
    const url = `http://${host}:${port}/orders/${orderId}/status`;

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: orderStatus }),
      });
      if (!res.ok) {
        this.logger.warn(
          `Échec mise à jour commande ${orderId} -> ${orderStatus} (HTTP ${res.status}).`
        );
        return;
      }
      this.logger.log(`Commande ${orderId} mise à jour : ${orderStatus}.`);
    } catch (err) {
      this.logger.warn(
        `order-service injoignable pour la commande ${orderId} : ${(err as Error).message}`
      );
    }
  }
}

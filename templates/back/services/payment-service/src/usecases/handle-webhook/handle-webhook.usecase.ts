import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IPaymentRepository } from '../../repositories/payment.repository';
import { IPaymentProvider } from '../../providers/payment-provider.interface';

@Injectable()
export class HandleWebhookUseCase {
  private readonly logger = new Logger(HandleWebhookUseCase.name);

  constructor(
    private readonly paymentRepo: IPaymentRepository,
    private readonly paymentProvider: IPaymentProvider
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

    return { received: true, status: event.status };
  }
}

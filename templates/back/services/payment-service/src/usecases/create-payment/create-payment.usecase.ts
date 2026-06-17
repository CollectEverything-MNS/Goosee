import { Injectable } from '@nestjs/common';
import { Payment } from '../../entities/payment.entity';
import { IPaymentRepository } from '../../repositories/payment.repository';
import { IPaymentProvider } from '../../providers/payment-provider.interface';
import { CreatePaymentDto } from './create-payment.dto';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    private readonly paymentRepo: IPaymentRepository,
    private readonly paymentProvider: IPaymentProvider
  ) {}

  async execute(dto: CreatePaymentDto) {
    // On enregistre d'abord le paiement en attente, puis on crée l'intention chez le
    // prestataire et on stocke sa référence : le webhook fera foi pour le statut final.
    const payment = await this.paymentRepo.save(
      new Payment({
        orderId: dto.orderId,
        amountCents: dto.amountCents,
        currency: dto.currency ?? 'eur',
        status: 'pending',
        provider: 'stripe',
      })
    );

    const intent = await this.paymentProvider.createIntent(payment);

    payment.providerRef = intent.providerRef;
    const saved = await this.paymentRepo.save(payment);

    return {
      message: 'Payment intent created successfully',
      payment: saved,
      clientSecret: intent.clientSecret,
    };
  }
}

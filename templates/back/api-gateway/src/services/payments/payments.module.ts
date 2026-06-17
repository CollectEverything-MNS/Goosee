import { Module } from '@nestjs/common';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { CreatePaymentController } from './usecases/create-payment/create-payment.controller';
import { GetPaymentController } from './usecases/get-payment/get-payment.controller';
import { WebhookController } from './usecases/webhook/webhook.controller';

@Module({
  imports: [SharedSecurityModule],
  // WebhookController avant GetPayment : /payments/webhook doit primer sur /payments/:id.
  controllers: [CreatePaymentController, WebhookController, GetPaymentController],
})
export class PaymentsModule {}

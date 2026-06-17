import { Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { HandleWebhookUseCase } from './handle-webhook.usecase';

@Controller('payments')
export class HandleWebhookController {
  constructor(private readonly handleWebhookUseCase: HandleWebhookUseCase) {}

  // Endpoint appelé par le prestataire (Stripe). Le corps brut est requis pour la
  // vérification de signature (activé via rawBody dans main.ts).
  @Post('webhook')
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string
  ) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
    return this.handleWebhookUseCase.execute(rawBody, signature);
  }
}

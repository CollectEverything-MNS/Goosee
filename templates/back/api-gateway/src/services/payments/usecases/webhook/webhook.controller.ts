import { Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Payments')
@Controller()
export class WebhookController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  // Endpoint appelé par Stripe (pas le front). On relaie le corps BRUT (rawBody) tel quel,
  // sans re-sérialisation : la vérif de signature Stripe (constructEvent) compare la
  // signature aux octets exacts reçus. rawBody est activé via NestFactory.create({ rawBody: true }).
  @Post(routesConfig.payment.webhook.path)
  @ApiExcludeEndpoint()
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string
  ) {
    const url = routesConfig.payment.webhook.link(this.services.payment);
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
    return this.httpProxy.postWithConfig(
      url,
      rawBody,
      {
        headers: {
          'content-type': 'application/json',
          ...(signature ? { 'stripe-signature': signature } : {}),
        },
      },
      'Payment webhook failed'
    );
  }
}

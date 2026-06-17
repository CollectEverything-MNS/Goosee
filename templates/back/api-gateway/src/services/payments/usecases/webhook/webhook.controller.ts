import { Body, Controller, Headers, Post } from '@nestjs/common';
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

  // Endpoint appelé par Stripe (pas le front). On relaie le corps et la signature.
  // TODO(Florent): pour la vraie vérif de signature Stripe, faire transiter le corps
  // BRUT (rawBody) sans re-sérialisation — sinon constructEvent échouera.
  @Post(routesConfig.payment.webhook.path)
  @ApiExcludeEndpoint()
  async webhook(@Body() body: unknown, @Headers('stripe-signature') signature?: string) {
    const url = routesConfig.payment.webhook.link(this.services.payment);
    return this.httpProxy.postWithConfig(
      url,
      body,
      { headers: signature ? { 'stripe-signature': signature } : {} },
      'Payment webhook failed'
    );
  }
}

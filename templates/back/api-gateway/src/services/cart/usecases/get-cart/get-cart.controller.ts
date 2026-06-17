import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Cart')
@Controller()
export class GetCartController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  // Public : le storefront gère son panier via un sessionKey (client ou invité).
  @Get(routesConfig.cart.getCart.path)
  @ApiOperation({ summary: 'Récupération du panier' })
  async get(@Param('sessionKey') sessionKey: string) {
    const url = routesConfig.cart.getCart.link(this.services.cart, sessionKey);
    return this.httpProxy.get(url, 'Get cart failed');
  }
}

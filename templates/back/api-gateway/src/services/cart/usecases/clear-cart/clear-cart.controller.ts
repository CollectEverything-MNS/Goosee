import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Cart')
@Controller()
export class ClearCartController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Delete(routesConfig.cart.clearCart.path)
  @ApiOperation({ summary: 'Vidage du panier' })
  async clear(@Param('sessionKey') sessionKey: string) {
    const url = routesConfig.cart.clearCart.link(this.services.cart, sessionKey);
    return this.httpProxy.delete(url, 'Clear cart failed');
  }
}

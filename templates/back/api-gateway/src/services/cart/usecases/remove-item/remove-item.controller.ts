import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Cart')
@Controller()
export class RemoveItemController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Delete(routesConfig.cart.removeItem.path)
  @ApiOperation({ summary: "Suppression d'un article du panier" })
  async remove(
    @Param('sessionKey') sessionKey: string,
    @Param('productId') productId: string
  ) {
    const url = routesConfig.cart.removeItem.link(this.services.cart, sessionKey, productId);
    return this.httpProxy.delete(url, 'Remove cart item failed');
  }
}

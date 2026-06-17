import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Orders')
@Controller()
export class GetOrderController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  // Public : la page de confirmation de commande s'appuie sur l'id reçu au checkout.
  @Get(routesConfig.order.getOrder.path)
  @ApiOperation({ summary: "Récupération d'une commande" })
  async get(@Param('id') id: string) {
    const url = routesConfig.order.getOrder.link(this.services.order, id);
    return this.httpProxy.get(url, 'Get order failed');
  }
}

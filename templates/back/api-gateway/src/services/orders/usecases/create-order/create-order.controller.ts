import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { CreateOrderDto } from './create-order.dto';

@ApiTags('Orders')
@Controller()
export class CreateOrderController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  // Checkout public : un visiteur non connecté peut passer commande (achat invité).
  @Post(routesConfig.order.createOrder.path)
  @ApiOperation({ summary: "Création d'une commande" })
  async create(@Body() dto: CreateOrderDto) {
    const url = routesConfig.order.createOrder.link(this.services.order);
    return this.httpProxy.post(url, dto, 'Create order failed');
  }
}

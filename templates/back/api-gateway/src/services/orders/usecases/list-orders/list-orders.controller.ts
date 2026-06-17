import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Orders')
@Controller()
export class ListOrdersController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.order.listOrders.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('orders')
  @ApiOperation({ summary: 'Liste des commandes' })
  async list(@Query('customerId') customerId?: string) {
    const base = routesConfig.order.listOrders.link(this.services.order);
    const url = customerId ? `${base}?customerId=${encodeURIComponent(customerId)}` : base;
    return this.httpProxy.get(url, 'List orders failed');
  }
}

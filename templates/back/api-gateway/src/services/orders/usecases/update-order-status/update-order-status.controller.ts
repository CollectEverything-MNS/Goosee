import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';
import { UpdateOrderStatusDto } from './update-order-status.dto';

@ApiTags('Orders')
@Controller()
export class UpdateOrderStatusController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Patch(routesConfig.order.updateOrderStatus.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('orders')
  @ApiOperation({ summary: "Mise à jour du statut d'une commande" })
  async update(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const url = routesConfig.order.updateOrderStatus.link(this.services.order, id);
    return this.httpProxy.patch(url, dto, 'Update order status failed');
  }
}

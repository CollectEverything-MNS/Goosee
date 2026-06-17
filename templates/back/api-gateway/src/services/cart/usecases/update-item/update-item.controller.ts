import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { UpdateItemDto } from './update-item.dto';

@ApiTags('Cart')
@Controller()
export class UpdateItemController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Patch(routesConfig.cart.updateItem.path)
  @ApiOperation({ summary: "Mise à jour de la quantité d'un article" })
  async update(
    @Param('sessionKey') sessionKey: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateItemDto
  ) {
    const url = routesConfig.cart.updateItem.link(this.services.cart, sessionKey, productId);
    return this.httpProxy.patch(url, dto, 'Update cart item failed');
  }
}

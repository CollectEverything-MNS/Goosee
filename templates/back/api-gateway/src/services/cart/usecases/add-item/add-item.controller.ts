import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { AddItemDto } from './add-item.dto';

@ApiTags('Cart')
@Controller()
export class AddItemController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.cart.addItem.path)
  @ApiOperation({ summary: 'Ajout d\'un article au panier' })
  async add(@Param('sessionKey') sessionKey: string, @Body() dto: AddItemDto) {
    const url = routesConfig.cart.addItem.link(this.services.cart, sessionKey);
    return this.httpProxy.post(url, dto, 'Add cart item failed');
  }
}

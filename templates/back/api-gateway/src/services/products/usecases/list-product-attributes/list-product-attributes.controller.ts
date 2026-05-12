import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Products')
@Controller()
export class ListProductAttributesController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.product.listProductAttributes.path)
  @ApiOperation({ summary: "Attributs d'un produit" })
  async list(@Param('id') id: string) {
    const url = routesConfig.product.listProductAttributes.link(this.services.product, id);
    return this.httpProxy.get(url, 'List product attributes failed');
  }
}

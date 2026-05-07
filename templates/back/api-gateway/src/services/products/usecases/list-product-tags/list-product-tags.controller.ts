import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Products')
@Controller()
export class ListProductTagsController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.product.listProductTags.path)
  @ApiOperation({ summary: "Tags d'un produit" })
  async list(@Param('id') id: string) {
    const url = routesConfig.product.listProductTags.link(this.services.product, id);
    return this.httpProxy.get(url, 'List product tags failed');
  }
}

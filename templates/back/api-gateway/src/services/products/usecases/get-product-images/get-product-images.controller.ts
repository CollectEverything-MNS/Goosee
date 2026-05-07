import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Products')
@Controller()
export class GetProductImagesController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.product.getImages.path)
  @ApiOperation({ summary: "Images d'un produit" })
  async get(@Param('id') id: string) {
    const url = routesConfig.product.getImages.link(this.services.product, id);
    return this.httpProxy.get(url, 'Get product images failed');
  }
}

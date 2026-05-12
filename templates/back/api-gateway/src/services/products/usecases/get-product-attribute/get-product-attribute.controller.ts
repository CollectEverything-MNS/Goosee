import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Products')
@Controller()
export class GetProductAttributeController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.product.getProductAttribute.path)
  @ApiOperation({ summary: "Récupération d'un attribut produit" })
  async get(@Param('id') id: string, @Param('attributeId') attributeId: string) {
    const url = routesConfig.product.getProductAttribute.link(
      this.services.product,
      id,
      attributeId
    );
    return this.httpProxy.get(url, 'Get product attribute failed');
  }
}

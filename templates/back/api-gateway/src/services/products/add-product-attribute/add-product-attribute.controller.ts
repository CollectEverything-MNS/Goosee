import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';
import { AddProductAttributeDto } from './add-product-attribute.dto';

@ApiTags('Products')
@Controller()
export class AddProductAttributeController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.product.addProductAttribute.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('products')
  @ApiOperation({ summary: "Ajout d'un attribut à un produit" })
  async add(@Param('id') id: string, @Body() dto: AddProductAttributeDto) {
    const url = routesConfig.product.addProductAttribute.link(this.services.product, id);
    return this.httpProxy.post(url, dto, 'Add product attribute failed');
  }
}

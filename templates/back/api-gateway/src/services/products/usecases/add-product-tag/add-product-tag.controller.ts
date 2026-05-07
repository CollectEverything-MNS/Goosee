import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';
import { AddProductTagDto } from './add-product-tag.dto';

@ApiTags('Products')
@Controller()
export class AddProductTagController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.product.addProductTag.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('products')
  @ApiOperation({ summary: 'Associer un tag à un produit' })
  async add(@Param('id') id: string, @Body() dto: AddProductTagDto) {
    const url = routesConfig.product.addProductTag.link(this.services.product, id);
    return this.httpProxy.post(url, dto, 'Add product tag failed');
  }
}

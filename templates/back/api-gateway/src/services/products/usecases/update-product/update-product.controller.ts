import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';
import { UpdateProductDto } from './update-product.dto';

@ApiTags('Products')
@Controller()
export class UpdateProductController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Patch(routesConfig.product.updateProduct.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('products')
  @ApiOperation({ summary: "Mise à jour d'un produit" })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const url = routesConfig.product.updateProduct.link(this.services.product, id);
    return this.httpProxy.patch(url, dto, 'Update product failed');
  }
}
